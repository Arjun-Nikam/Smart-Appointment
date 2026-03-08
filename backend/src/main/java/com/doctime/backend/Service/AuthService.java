package com.doctime.backend.Service;

import com.doctime.backend.Config.JwtUtil;
import com.doctime.backend.Dto.AuthResponse;
import com.doctime.backend.Entity.Doctor;
import com.doctime.backend.Entity.Patient;
import com.doctime.backend.Repo.DoctorRepo;
import com.doctime.backend.Repo.PatientRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;


import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private PatientRepo patientRepo;

    @Autowired
    private DoctorRepo doctorRepo;

    @Autowired
    private PasswordEncoder passwordEncoder; // Injecting our BCrypt tool!

    @Autowired
    private JwtUtil jwtUtil;

    // ==========================================
    // 1. PATIENT SIGNUP
    // ==========================================

    // Add these to your existing @Autowired fields
    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    // Admin login — credentials come from application.properties / env vars
    public Map<String, String> loginAdmin(String email, String password) {
        if (!email.equals(adminEmail) || !password.equals(adminPassword)) {
            throw new RuntimeException("Invalid credentials.");
        }

        // Generate a JWT with ADMIN role — valid for 10 hours like others
        String token = jwtUtil.generateToken(email, "ADMIN", -1L);
        return Map.of("token", token, "role", "ADMIN");
    }
    public Patient registerPatient(Patient patient) {
        if (patientRepo.findByEmail(patient.getEmail()).isPresent()) {
            throw new RuntimeException("Patient email is already taken!");
        }
        // HASH THE PASSWORD BEFORE SAVING!
        patient.setPassword(passwordEncoder.encode(patient.getPassword()));
        return patientRepo.save(patient);
    }

    // ==========================================
    // 2. DOCTOR SIGNUP
    // ==========================================
    public Doctor registerDoctor(Doctor doctor) {
        if (doctorRepo.findByEmail(doctor.getEmail()).isPresent()) {
            throw new RuntimeException("Doctor email is already registered!");
        }
        // HASH THE PASSWORD BEFORE SAVING!
        doctor.setPassword(passwordEncoder.encode(doctor.getPassword()));
        return doctorRepo.save(doctor);
    }

    // ==========================================
    // 3. SMART UNIVERSAL LOGIN (No Role Needed!)
    // ==========================================
    public AuthResponse login(String email, String rawPassword) {

        // 1. Check the Patient Table first (since 99% of users are patients)
        Optional<Patient> patient = patientRepo.findByEmail(email);
        if (patient.isPresent()) {
            if (passwordEncoder.matches(rawPassword, patient.get().getPassword())) {
                String token = jwtUtil.generateToken(email, "PATIENT", patient.get().getId());
                return new AuthResponse(token, "PATIENT", patient.get());
            } else {
                throw new RuntimeException("Invalid Password!");
            }
        }

        // 2. If not a Patient, check the Doctor Table
        Optional<Doctor> doctor = doctorRepo.findByEmail(email);
        if (doctor.isPresent()) {
            if (passwordEncoder.matches(rawPassword, doctor.get().getPassword())) {
                String token = jwtUtil.generateToken(email, "DOCTOR", doctor.get().getId());
                return new AuthResponse(token, "DOCTOR", doctor.get());
            } else {
                throw new RuntimeException("Invalid Password!");
            }
        }

        // 3. If email is in neither table
        throw new RuntimeException("User not found with this email!");
    }



}