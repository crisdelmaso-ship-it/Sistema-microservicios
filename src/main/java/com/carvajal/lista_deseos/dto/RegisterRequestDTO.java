package com.carvajal.lista_deseos.dto;

import lombok.Data;

@Data 
public class RegisterRequestDTO {

    private String username;
    private String email;
    private String password;
    
}
