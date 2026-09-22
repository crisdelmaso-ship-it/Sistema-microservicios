package com.carvajal.purchases.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.carvajal.purchases.entity.Purchase;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    List<Purchase> findByUserIdOrderByCreatedAtDesc(Long userId);
}