package com.doctime.backend.Repo;

import com.doctime.backend.Entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepo extends JpaRepository<Doctor, Long> {

    // For Doctor Login
    Optional<Doctor> findByEmail(String email);

    // For Patient Search: Find doctors by exactly matching the specialty
    List<Doctor> findBySpecializationIgnoreCase(String specialization);

    // For Patient Search: If they type "sha", it finds "Dr. Sharma"
    List<Doctor> findByNameContainingIgnoreCase(String name);
}