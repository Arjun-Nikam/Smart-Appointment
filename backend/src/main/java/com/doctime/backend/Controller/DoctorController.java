package com.doctime.backend.Controller;

import com.doctime.backend.Dto.ScheduleUpdateRequest;
import com.doctime.backend.Entity.Doctor;
import com.doctime.backend.Service.DoctorService; // 👈 Use the Service
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    private DoctorService doctorService; // 👈 Inject Service, not Repo

    @PreAuthorize("hasRole('DOCTOR')")
    @PutMapping("/{doctorId}/schedule")
    public ResponseEntity<?> updateDoctorSchedule(
            @PathVariable Long doctorId,
            @RequestBody ScheduleUpdateRequest request) {
        try {
            Doctor updatedDoctor = doctorService.updateDoctorSchedule(doctorId, request);
            return ResponseEntity.ok(updatedDoctor);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}