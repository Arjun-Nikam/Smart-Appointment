package com.doctime.backend.Controller;

import com.doctime.backend.Entity.Doctor;
import com.doctime.backend.Repo.DoctorRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard") // All URLs start with this now!
public class PatientDashboardController {

    @Autowired
    private DoctorRepo doctorRepo;

    // 1. Get ALL doctors (useful for the homepage)
    @GetMapping("/all")
    public ResponseEntity<List<Doctor>> getAllDoctors() { // Added ResponseEntity!
        return ResponseEntity.ok(doctorRepo.findAll());
    }

    // 2. Search by Specialty (e.g., /api/dashboard/specialty/Dentist)
    @GetMapping("/specialty/{specialty}")
    public ResponseEntity<List<Doctor>> getDoctorsBySpecialty(@PathVariable String specialty) {
        List<Doctor> doctors = doctorRepo.findBySpecializationIgnoreCase(specialty);
        return ResponseEntity.ok(doctors);
    }

    // 3. Search by Name (e.g., /api/dashboard/search?name=Sharma)
    @GetMapping("/search")
    public ResponseEntity<List<Doctor>> searchDoctorByName(@RequestParam String name) {
        List<Doctor> doctors = doctorRepo.findByNameContainingIgnoreCase(name);
        return ResponseEntity.ok(doctors);
    }

    // 4. Get all Categories (For the frontend to build the UI sections)
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        List<String> categories = doctorRepo.findAllSpecializations();
        return ResponseEntity.ok(categories);
    }

    // 5. Find Closest Doctors (The GPS feature)
    @GetMapping("/nearby")
    public ResponseEntity<List<Doctor>> getNearbyDoctors(
            @RequestParam double lat,
            @RequestParam double lng) {

        List<Doctor> nearestDoctors = doctorRepo.findNearbyDoctors(lat, lng);
        return ResponseEntity.ok(nearestDoctors);
    }
}