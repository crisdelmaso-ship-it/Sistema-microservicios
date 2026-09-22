package com.carvajal.purchases.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreatePurchaseRequest {

    @NotNull
    @JsonProperty("productoId")
    private Long productId;

    @NotNull
    @Positive
    @JsonProperty("cantidad")
    private Integer quantity;
}