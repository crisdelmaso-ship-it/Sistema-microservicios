package com.carvajal.purchases.client;

import java.math.BigDecimal;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class CatalogClient {

    private final RestClient restClient;

    public CatalogClient(@Value("${catalog.base-url}") String baseUrl,
            RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.baseUrl(baseUrl).build();
    }

    public ProductInfo getProduct(Long productId) {
        try {
                Map<String, Object> product = restClient.get()
                    .uri("/api/products/{id}", productId)
                    .retrieve()
                    .body(Map.class);

                if (product == null || product.get("id") == null) {
                throw new CatalogException("El producto no fue encontrado");
            }

            return new ProductInfo(
                    Long.valueOf(String.valueOf(product.get("id"))),
                    new BigDecimal(String.valueOf(product.get("precio"))),
                    Integer.valueOf(String.valueOf(product.get("stock"))));
        } catch (RestClientException exception) {
            throw new CatalogException("No fue posible consultar el catalogo", exception);
        }
    }

    public void updateStock(Long productId, int stock) {
        try {
            restClient.patch()
                    .uri("/api/products/{id}/stock", productId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("stock", stock))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException exception) {
            throw new CatalogException("No fue posible actualizar el stock", exception);
        }
    }

    public record ProductInfo(Long id, BigDecimal price, int stock) {
    }

    public static class CatalogException extends RuntimeException {
        public CatalogException(String message) {
            super(message);
        }

        public CatalogException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}