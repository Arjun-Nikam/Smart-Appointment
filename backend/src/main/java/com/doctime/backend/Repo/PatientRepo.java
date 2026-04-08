package com.doctime.backend.Repo;

import com.doctime.backend.Entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepo extends JpaRepository<Patient, Long> {

    // Finds a patient by email (useful for login/registration check)
    Optional<Patient> findByEmail(String email);

    // Finds a patient by phone number
    Optional<Patient> findByPhoneNumber(String phoneNumber);
}