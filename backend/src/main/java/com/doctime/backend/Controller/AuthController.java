package com.doctime.backend.Controller;

import com.doctime.backend.Config.TokenBlacklist;
import com.doctime.backend.Dto.LoginRequest;
import com.doctime.backend.Entity.Doctor;
import com.doctime.backend.Entity.Patient;
import com.doctime.backend.Service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
// FIX #2: Removed @CrossOrigin — CORS is already handled globally in SecurityConfig
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private TokenBlacklist tokenBlacklist;

    // FIX #1: Secret loaded from application.properties — never hardcoded
    @Value("${admin.secret}")
    private String adminSecret;

    // ─────────────────────────────────────────────
    // PATIENT SIGNUP
    // POST /api/auth/patient/signup
    // ─────────────────────────────────────────────
    @PostMapping("/patient/signup")
    public ResponseEntity<?> registerPatient(@RequestBody Patient patient) {
        try {
            Patient savedPatient = authService.registerPatient(patient);
            return ResponseEntity.ok(savedPatient);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ─────────────────────────────────────────────
    // DOCTOR SIGNUP (Admin only)
    // POST /api/auth/doctor/signup
    // Header: Admin-Key: <secret>
    // ─────────────────────────────────────────────
    @PostMapping("/doctor/signup")
    public ResponseEntity<?> registerDoctor(
            @RequestBody Doctor doctor,
            @RequestHeader("Admin-Key") String adminKey) {

        if (!adminSecret.equals(adminKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Only Admins can create doctor profiles!");
        }

        try {
            Doctor savedDoctor = authService.registerDoctor(doctor);
            return ResponseEntity.ok(savedDoctor);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ─────────────────────────────────────────────
    // LOGIN
    // POST /api/auth/login
    // Body: { "email": "x@x.com", "password": "123" }
    // ─────────────────────────────────────────────
    // FIX #3: Changed @RequestParam → @RequestBody
    // @RequestParam puts credentials in the URL: /login?email=x&password=y
    // That gets logged by every server, proxy, and browser history
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
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
    // LOGOUT
    // POST /api/auth/logout
    // Header: Authorization: Bearer <token>
    // ─────────────────────────────────────────────
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {

        // Guard: make sure header is properly formed
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body("Invalid Authorization header.");
        }

        String token = authHeader.substring(7);
        tokenBlacklist.blacklist(token);

        return ResponseEntity.ok(Map.of("message", "Logged out successfully."));
    }
}