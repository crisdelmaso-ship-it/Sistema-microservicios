package com.carvajal.purchases.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.carvajal.purchases.entity.Purchase;

public record PurchaseResponse(
    @JsonProperty("identificador")
        Long id,
    @JsonProperty("usuarioId")
        Long userId,
    @JsonProperty("nombreUsuario")
    String username,
    @JsonProperty("productoId")
        Long productId,
    @JsonProperty("cantidad")
        Integer quantity,
    @JsonProperty("precioUnitario")
        BigDecimal unitPrice,
    @JsonProperty("total")
        BigDecimal total,
    @JsonProperty("fechaCreacion")
        LocalDateTime createdAt) {

    public static PurchaseResponse from(Purchase purchase) {
        return new PurchaseResponse(
                purchase.getId(),
                purchase.getUserId(),
                purchase.getUsername(),
                purchase.getProductId(),
                purchase.getQuantity(),
                purchase.getUnitPrice(),
                purchase.getTotal(),
                purchase.getCreatedAt());
    }
}