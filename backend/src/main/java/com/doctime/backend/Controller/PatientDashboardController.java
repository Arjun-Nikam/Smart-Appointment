package com.doctime.backend.Controller;

import com.doctime.backend.Entity.Doctor;
import com.doctime.backend.Service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
// FIX #3: Removed @CrossOrigin — handled globally in SecurityConfig
public class PatientDashboardController {

    @Autowired
    private DoctorService doctorService;

    // FIX #4: Added @PreAuthorize to all endpoints
    // Dashboard is only for logged-in patients

    @PreAuthorize("hasRole('PATIENT')")
    @GetMapping("/all")
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @PreAuthorize("hasRole('PATIENT')")
    @GetMapping("/specialty/{specialty}")
    public ResponseEntity<List<Doctor>> getDoctorsBySpecialty(
            @PathVariable String specialty) {
        return ResponseEntity.ok(doctorService.getDoctorsBySpecialty(specialty));
    }

    @PreAuthorize("hasRole('PATIENT')")
    @GetMapping("/search")
    public ResponseEntity<List<Doctor>> searchDoctorByName(
            @RequestParam String name) {
        return ResponseEntity.ok(doctorService.searchDoctorByName(name));
    }

    @PreAuthorize("hasRole('PATIENT')")
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(doctorService.getAllCategories());
    }

    @PreAuthorize("hasRole('PATIENT')")
    @GetMapping("/nearby")
    public ResponseEntity<List<Doctor>> getNearbyDoctors(
            @RequestParam double lat,
            @RequestParam double lng) {
        return ResponseEntity.ok(doctorService.getNearbyDoctors(lat, lng));
    }

    @PreAuthorize("hasRole('PATIENT')")
    @GetMapping("/hospital")
    public ResponseEntity<List<Doctor>> searchByHospital(
            @RequestParam String name) {
        return ResponseEntity.ok(doctorService.searchByHospitalName(name));
    }
}