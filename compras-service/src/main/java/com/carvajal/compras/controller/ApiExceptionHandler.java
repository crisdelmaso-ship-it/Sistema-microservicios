package com.carvajal.purchases.controller;

import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.carvajal.purchases.client.CatalogClient.CatalogException;
import com.carvajal.purchases.service.PurchaseService.InsufficientStockException;

@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger LOGGER = Logger.getLogger(ApiExceptionHandler.class.getName());

    @ExceptionHandler(InsufficientStockException.class)
    ResponseEntity<Map<String, String>> insufficientStock(InsufficientStockException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje", exception.getMessage()));
    }

    @ExceptionHandler(CatalogException.class)
    ResponseEntity<Map<String, String>> catalog(CatalogException exception) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("mensaje", exception.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, String>> unexpected(Exception exception) {
        LOGGER.log(Level.SEVERE, "Error procesando la solicitud de compras", exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("mensaje", "No se pudo procesar la solicitud: " + exception.getMessage()));
    }
}