package com.doctime.backend.Controller;

import com.doctime.backend.Entity.Doctor;
import com.doctime.backend.Repo.DoctorRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    private DoctorRepo doctorRepo;

    // 1. Get ALL doctors (useful for the homepage)
    @GetMapping("/all")
    public List<Doctor> getAllDoctors() {
        return doctorRepo.findAll();
    }

    // 2. Search by Specialty (e.g., /api/doctors/specialty/Dentist)
    @GetMapping("/specialty/{specialty}")
    public ResponseEntity<List<Doctor>> getDoctorsBySpecialty(@PathVariable String specialty) {
        List<Doctor> doctors = doctorRepo.findBySpecializationIgnoreCase(specialty);
        return ResponseEntity.ok(doctors);
    }

    // 3. Search by Name (e.g., /api/doctors/search?name=Sharma)
    @GetMapping("/search")
    public ResponseEntity<List<Doctor>> searchDoctorByName(@RequestParam String name) {
        List<Doctor> doctors = doctorRepo.findByNameContainingIgnoreCase(name);
        return ResponseEntity.ok(doctors);
    }
}