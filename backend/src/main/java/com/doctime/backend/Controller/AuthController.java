package com.doctime.backend.Controller;

import com.doctime.backend.Config.TokenBlacklist;
import com.doctime.backend.Dto.DoctorSignupRequest;
import com.doctime.backend.Dto.LoginRequest;
import com.doctime.backend.Dto.PatientSignupRequest;
import com.doctime.backend.Entity.Doctor;
import com.doctime.backend.Entity.Patient;
import com.doctime.backend.Service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private TokenBlacklist tokenBlacklist;

    // ─────────────────────────────────────────────
    // PATIENT SIGNUP
    // POST /api/auth/patient/signup
    // ─────────────────────────────────────────────
    @PostMapping("/patient/signup")
    public ResponseEntity<?> registerPatient(
            @Valid @RequestBody PatientSignupRequest request) {
        try {
            // Map DTO → Entity here, AFTER validation passes
            Patient patient = new Patient();
            patient.setName(request.getName());
            patient.setEmail(request.getEmail());
            patient.setPhoneNumber(request.getPhoneNumber());
            patient.setAge(request.getAge());
            patient.setGender(request.getGender());
            patient.setPassword(request.getPassword()); // raw — hashed in service

            Patient saved = authService.registerPatient(patient);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ─────────────────────────────────────────────
    // DOCTOR SIGNUP (ADMIN role required)
    // POST /api/auth/doctor/signup
    // Header: Authorization: Bearer <ADMIN token>
    // ─────────────────────────────────────────────
    // FIX: Removed Admin-Key header — now requires a real ADMIN JWT
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/doctor/signup")
    public ResponseEntity<?> registerDoctor(
            @Valid @RequestBody DoctorSignupRequest request) {
        try {
            Doctor doctor = new Doctor();
            doctor.setName(request.getName());
            doctor.setEmail(request.getEmail());
            doctor.setSpecialization(request.getSpecialization());
            doctor.setHospitalName(request.getHospitalName());
            doctor.setAverageConsultationTime(request.getAverageConsultationTime());
            doctor.setPassword(request.getPassword()); // raw — hashed in service
            doctor.setLatitude(request.getLatitude());
            doctor.setLongitude(request.getLongitude());

            Doctor saved = authService.registerDoctor(doctor);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ─────────────────────────────────────────────
    // PATIENT / DOCTOR LOGIN
    // POST /api/auth/login
    // Body: { "email": "x@x.com", "password": "pass" }
    // ─────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Object result = authService.login(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
            );
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    // ─────────────────────────────────────────────
    // ADMIN LOGIN
    // POST /api/auth/admin/login
    // Body: { "email": "admin@doctime.com", "password": "pass" }
    // ─────────────────────────────────────────────
    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Map<String, String> result = authService.loginAdmin(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
            );
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    // ─────────────────────────────────────────────
    // LOGOUT
    // POST /api/auth/logout
    // Header: Authorization: Bearer <token>
    // ─────────────────────────────────────────────
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body("Invalid Authorization header.");
        }
        tokenBlacklist.blacklist(authHeader.substring(7));
        return ResponseEntity.ok(Map.of("message", "Logged out successfully."));
    }
}