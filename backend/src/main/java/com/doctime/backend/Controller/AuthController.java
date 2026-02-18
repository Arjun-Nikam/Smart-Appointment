package com.doctime.backend.Controller;

import com.doctime.backend.Entity.Doctor;
import com.doctime.backend.Entity.Patient;
import com.doctime.backend.Service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    private final String ADMIN_SECRET = "doctime-super-secret-key-2026";

    @PostMapping("/patient/signup")
    public ResponseEntity<?> registerPatient(@RequestBody Patient patient) {
        try {
            Patient savedPatient = authService.registerPatient(patient);
            return ResponseEntity.ok(savedPatient);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/doctor/signup")
    public ResponseEntity<?> registerDoctor(@RequestBody Doctor doctor, @RequestHeader("Admin-Key") String adminKey) {
        if (!ADMIN_SECRET.equals(adminKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Only Admins can create doctor profiles!");
        }

        try {
            Doctor savedDoctor = authService.registerDoctor(doctor);
            return ResponseEntity.ok(savedDoctor);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String email, @RequestParam String password) {
        try {
            Object user = authService.login(email, password);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }
}