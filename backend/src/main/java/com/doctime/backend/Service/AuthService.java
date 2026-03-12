package com.doctime.backend.Service;

import com.doctime.backend.Config.JwtUtil;
import com.doctime.backend.Dto.AuthResponse;
import com.doctime.backend.Entity.Admin;
import com.doctime.backend.Entity.Doctor;
import com.doctime.backend.Entity.Patient;
import com.doctime.backend.Repo.AdminRepo;
import com.doctime.backend.Repo.DoctorRepo;
import com.doctime.backend.Repo.PatientRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired private PatientRepo patientRepo;
    @Autowired private DoctorRepo doctorRepo;
    @Autowired private AdminRepo adminRepo;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;

    // ─────────────────────────────────────────────
    // PATIENT SIGNUP
    // ─────────────────────────────────────────────
    public Patient registerPatient(Patient patient) {
        if (patientRepo.findByEmail(patient.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already registered.");
        }
        patient.setPassword(passwordEncoder.encode(patient.getPassword()));
        return patientRepo.save(patient);
    }

    // ─────────────────────────────────────────────
    // DOCTOR SIGNUP
    // ─────────────────────────────────────────────
    public Doctor registerDoctor(Doctor doctor) {
        if (doctorRepo.findByEmail(doctor.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already registered.");
        }
        doctor.setPassword(passwordEncoder.encode(doctor.getPassword()));
        return doctorRepo.save(doctor);
    }

    // ─────────────────────────────────────────────
    // UNIVERSAL LOGIN (Patient + Doctor)
    // ─────────────────────────────────────────────
    public AuthResponse login(String email, String rawPassword) {

        // Check Patient table first
        Optional<Patient> patient = patientRepo.findByEmail(email);
        if (patient.isPresent()) {
            if (passwordEncoder.matches(rawPassword, patient.get().getPassword())) {
                String token = jwtUtil.generateToken(email, "PATIENT", patient.get().getId());
                return new AuthResponse(token, "PATIENT", patient.get());
            } else {
                throw new RuntimeException("Invalid credentials.");
            }
        }

        // Check Doctor table second
        Optional<Doctor> doctor = doctorRepo.findByEmail(email);
        if (doctor.isPresent()) {
            if (passwordEncoder.matches(rawPassword, doctor.get().getPassword())) {
                String token = jwtUtil.generateToken(email, "DOCTOR", doctor.get().getId());
                return new AuthResponse(token, "DOCTOR", doctor.get());
            } else {
                throw new RuntimeException("Invalid credentials.");
            }
        }

        throw new RuntimeException("Invalid credentials.");
    }

    // ─────────────────────────────────────────────
    // ADMIN LOGIN
    // ─────────────────────────────────────────────
    public Map<String, String> loginAdmin(String email, String password) {
        Admin admin = adminRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials."));

        if (!passwordEncoder.matches(password, admin.getPassword())) {
            throw new RuntimeException("Invalid credentials.");
        }

        String token = jwtUtil.generateToken(admin.getEmail(), "ADMIN", admin.getId());
        return Map.of("token", token, "role", "ADMIN");
    }
}
