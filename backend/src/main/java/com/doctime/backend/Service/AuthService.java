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
    // 3. SECURE LOGIN
    // ==========================================

    public AuthResponse login(String email, String rawPassword, String role) {

        if (role.equalsIgnoreCase("PATIENT")) {
            Optional<Patient> patient = patientRepo.findByEmail(email);
            if (patient.isPresent() && passwordEncoder.matches(rawPassword, patient.get().getPassword())) {

                // Passwords match! Generate the JWT Token.
                String token = jwtUtil.generateToken(email, "PATIENT", patient.get().getId());
                return new AuthResponse(token, "PATIENT", patient.get());
            }
        }
        else if (role.equalsIgnoreCase("DOCTOR")) {
            Optional<Doctor> doctor = doctorRepo.findByEmail(email);
            if (doctor.isPresent() && passwordEncoder.matches(rawPassword, doctor.get().getPassword())) {

                // Passwords match! Generate the JWT Token.
                String token = jwtUtil.generateToken(email, "DOCTOR", doctor.get().getId());
                return new AuthResponse(token, "DOCTOR", doctor.get());
            }
        }

        throw new RuntimeException("Invalid Email or Password!");
    }



}