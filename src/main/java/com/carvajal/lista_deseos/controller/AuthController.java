package com.carvajal.lista_deseos.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.carvajal.lista_deseos.Service.AuthService;
import com.carvajal.lista_deseos.dto.GlobalMessageResponseDTO;
import com.carvajal.lista_deseos.dto.LoginRequestDto;
import com.carvajal.lista_deseos.dto.LoginResponseDTO;
import com.carvajal.lista_deseos.dto.RegisterRequestDTO;
import com.carvajal.lista_deseos.dto.UserDTO;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<GlobalMessageResponseDTO<UserDTO>> register(
            @RequestBody RegisterRequestDTO request) {

        try {
            GlobalMessageResponseDTO<UserDTO> response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<GlobalMessageResponseDTO<LoginResponseDTO>> login(
            @RequestBody LoginRequestDto request) {

        try {
            GlobalMessageResponseDTO<LoginResponseDTO> response = authService.login(request);
            return ResponseEntity.status(HttpStatus.OK).body(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }
}


    

