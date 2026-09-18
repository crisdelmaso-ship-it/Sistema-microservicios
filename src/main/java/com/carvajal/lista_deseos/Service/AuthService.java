package com.carvajal.lista_deseos.Service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.carvajal.lista_deseos.dto.GlobalMessageResponseDTO;
import com.carvajal.lista_deseos.dto.LoginRequestDto;
import com.carvajal.lista_deseos.dto.LoginResponseDTO;
import com.carvajal.lista_deseos.dto.RegisterRequestDTO;
import com.carvajal.lista_deseos.dto.UserDTO;
import com.carvajal.lista_deseos.entity.Users;
import com.carvajal.lista_deseos.repository.UsersRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final UsersRepository usersRepository;
    private final JwtService jwtService;

    public GlobalMessageResponseDTO<UserDTO> register(RegisterRequestDTO request) {

        GlobalMessageResponseDTO<UserDTO> response = new GlobalMessageResponseDTO<>();

      
        if (usersRepository.findFirstByEmail(request.getEmail()).isPresent()) {
            response.setMessage("El correo ya se encuentra en uso");
            return response;
        }

       
        if (usersRepository.findFirstByUsername(request.getUsername()).isPresent()) {
            response.setMessage("El nombre de usuario ya se encuentra en uso");
            return response;
        }

        Users user = new Users();

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(
            passwordEncoder.encode(request.getPassword())
        );

        usersRepository.save(user);

        UserDTO userDTO = new UserDTO();

        userDTO.setId(user.getId());
        userDTO.setUsername(user.getUsername());
        userDTO.setEmail(user.getEmail());

        response.setData(userDTO);
        response.setMessage("Usuario registrado correctamente");

        return response;
    }

    public GlobalMessageResponseDTO<LoginResponseDTO> login(LoginRequestDto request) {

    GlobalMessageResponseDTO<LoginResponseDTO> response =
            new GlobalMessageResponseDTO<>();

    Optional<Users> username =
            usersRepository.findFirstByUsername(request.getUser());

    Optional<Users> email =
            usersRepository.findFirstByEmail(request.getUser());

    if (username.isEmpty() && email.isEmpty()) {
        response.setMessage("Usuario no encontrado");
        return response;
    }

    if (username.isPresent()) {
        email = username;
    } else {
        username = email;
    }

    Users userFound = email.get();

    if (!passwordEncoder.matches(
            request.getPassword(),
            userFound.getPassword())) {

        response.setMessage("Contraseña incorrecta");
        return response;
    }

    String jwt = jwtService.generateToken(
            userFound.getEmail(),
            userFound.getId()
    );

    LoginResponseDTO loginResponse = new LoginResponseDTO();
    loginResponse.setJwt(jwt);

    response.setData(loginResponse);
    response.setMessage("Inicio de sesión exitoso");

    return response;
}
}