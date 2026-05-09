package com.transfercreditmatch.repositories;

import com.transfercreditmatch.entities.TransferRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransferRequestRepository extends JpaRepository<TransferRequest, Integer> {
}
