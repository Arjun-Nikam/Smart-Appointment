package com.doctime.backend.Controller;

import com.doctime.backend.Dto.ScheduleUpdateRequest;
import com.doctime.backend.Entity.Doctor;
import com.doctime.backend.Service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    // FIX #1 + #2: Removed doctorId from URL entirely
    // Identity resolved from JWT token — doctor can only update their own schedule
    @PreAuthorize("hasRole('DOCTOR')")
    @PutMapping("/my-schedule")
    public ResponseEntity<?> updateDoctorSchedule(
            @RequestBody ScheduleUpdateRequest request,
            Principal principal) {
        try {
            String doctorEmail = principal.getName();
            Doctor updatedDoctor = doctorService.updateDoctorSchedule(doctorEmail, request);
            return ResponseEntity.ok(updatedDoctor);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}