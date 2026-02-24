package com.doctime.backend.Controller;

import com.doctime.backend.Entity.Doctor;
import com.doctime.backend.Service.DoctorService; // 👈 Import the new Service!
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class PatientDashboardController {

    @Autowired
    private DoctorService doctorService; // 👈 Inject the Service layer, NOT the Repo!

    @GetMapping("/all")
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/specialty/{specialty}")
    public ResponseEntity<List<Doctor>> getDoctorsBySpecialty(@PathVariable String specialty) {
        return ResponseEntity.ok(doctorService.getDoctorsBySpecialty(specialty));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Doctor>> searchDoctorByName(@RequestParam String name) {
        return ResponseEntity.ok(doctorService.searchDoctorByName(name));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(doctorService.getAllCategories());
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<Doctor>> getNearbyDoctors(
            @RequestParam double lat,
            @RequestParam double lng) {
        return ResponseEntity.ok(doctorService.getNearbyDoctors(lat, lng));
    }

    @GetMapping("/hospital")
    public ResponseEntity<List<Doctor>> searchByHospital(@RequestParam String name) {
        return ResponseEntity.ok(doctorService.searchByHospitalName(name));
    }
}