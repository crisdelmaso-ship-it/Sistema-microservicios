package com.carvajal.purchases.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.carvajal.purchases.client.CatalogClient;
import com.carvajal.purchases.dto.CreatePurchaseRequest;
import com.carvajal.purchases.entity.Purchase;
import com.carvajal.purchases.repository.PurchaseRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final CatalogClient catalogClient;

    @Transactional
    public Purchase create(Long userId, String username, CreatePurchaseRequest request) {
        if (username == null || username.isBlank()) {
            username = "usuario-" + userId;
        }

        CatalogClient.ProductInfo product = catalogClient.getProduct(request.getProductId());

        if (product.stock() < request.getQuantity()) {
            throw new InsufficientStockException("Stock insuficiente para el producto solicitado");
        }

        int remainingStock = product.stock() - request.getQuantity();
        catalogClient.updateStock(product.id(), remainingStock);

        Purchase purchase = new Purchase();
        purchase.setUserId(userId);
        purchase.setUsername(username);
        purchase.setProductId(product.id());
        purchase.setQuantity(request.getQuantity());
        purchase.setUnitPrice(product.price());
        purchase.setTotal(product.price().multiply(BigDecimal.valueOf(request.getQuantity())));

        return purchaseRepository.save(purchase);
    }

    public List<Purchase> findByUser(Long userId) {
        return purchaseRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public static class InsufficientStockException extends RuntimeException {
        public InsufficientStockException(String message) {
            super(message);
        }
    }
}