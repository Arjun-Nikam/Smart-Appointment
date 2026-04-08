package com.doctime.backend.Service;

import com.doctime.backend.Entity.Patient;
import com.doctime.backend.Repo.PatientRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PatientService {

    @Autowired
    private PatientRepo patientRepo;

    public Patient getPatientByEmail(String email) {
        return patientRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials."));
    }
}