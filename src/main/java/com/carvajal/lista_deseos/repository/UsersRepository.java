package com.carvajal.lista_deseos.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.carvajal.lista_deseos.entity.Users;

public interface UsersRepository extends JpaRepository<Users, Long> {

    Optional<Users> findByUsername(String username);
    Optional<Users> findByEmail(String email);
    
    
}
