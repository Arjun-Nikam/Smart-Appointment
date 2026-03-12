package com.doctime.backend.Repo;

import com.doctime.backend.Entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepo extends JpaRepository<Admin, Long> {
    Optional<Admin> findByEmail(String email);
}