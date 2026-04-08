package com.doctime.backend.Controller;

import com.doctime.backend.Entity.Doctor;
import com.doctime.backend.Enum.DoctorStatus;
import com.doctime.backend.Repo.DoctorRepo;
import com.doctime.backend.Repo.PatientRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired private DoctorRepo doctorRepo;
    @Autowired private PatientRepo patientRepo;

    @GetMapping("/pending-doctors")
    public ResponseEntity<?> getPendingDoctors() {
        return ResponseEntity.ok(
                doctorRepo.findByStatus(DoctorStatus.PENDING)
        );
    }

    @GetMapping("/all-doctors")
    public ResponseEntity<?> getAllDoctors() {
        return ResponseEntity.ok(doctorRepo.findAll());
    }


    @GetMapping("/all-patients")
    public ResponseEntity<?> getAllPatients() {
        return ResponseEntity.ok(patientRepo.findAll());
    }

    @PutMapping("/approve/{doctorId}")
    public ResponseEntity<?> approveDoctor(@PathVariable Long doctorId) {
        Doctor doctor = doctorRepo.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        doctor.setStatus(DoctorStatus.APPROVED);
        doctorRepo.save(doctor);
        return ResponseEntity.ok("Doctor approved successfully.");
    }

    @PutMapping("/reject/{doctorId}")
    public ResponseEntity<?> rejectDoctor(@PathVariable Long doctorId) {
        Doctor doctor = doctorRepo.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        doctor.setStatus(DoctorStatus.REJECTED);
        doctorRepo.save(doctor);
        return ResponseEntity.ok("Doctor rejected.");
    }
}