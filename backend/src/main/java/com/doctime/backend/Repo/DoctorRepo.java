package com.doctime.backend.Repo;

import com.doctime.backend.Entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorRepo extends JpaRepository<Doctor, Long> {

    // "Get me all Cardiologists"
    List<Doctor> findBySpecialization(String specialization);

    // "Get me all doctors belonging to Apollo Hospital"
    List<Doctor> findByHospitalName(String hospitalName);
}