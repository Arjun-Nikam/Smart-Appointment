package com.doctime.backend.Controller;

import com.doctime.backend.Dto.ScheduleUpdateRequest;
import com.doctime.backend.Entity.Doctor;
import com.doctime.backend.Repo.DoctorRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    private DoctorRepo doctorRepo;

    // Update Doctor's availability and shift timings
    @PreAuthorize("hasRole('DOCTOR')")
    @PutMapping("/{doctorId}/schedule")
    public ResponseEntity<?> updateDoctorSchedule(
            @PathVariable Long doctorId,
            @RequestBody ScheduleUpdateRequest request) {

        try {
            Doctor doctor = doctorRepo.findById(doctorId)
                    .orElseThrow(() -> new RuntimeException("Doctor not found!"));

            // 1. Update the manual switch
            doctor.setAvailable(request.isAvailable());

            // 2. Clear old shifts and save the new ones
            if (request.getShifts() != null) {
                doctor.getShifts().clear();
                doctor.getShifts().addAll(request.getShifts());
            }

            doctorRepo.save(doctor);
            return ResponseEntity.ok(doctor);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}