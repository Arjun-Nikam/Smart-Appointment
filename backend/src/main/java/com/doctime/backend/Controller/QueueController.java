package com.doctime.backend.Controller;

import com.doctime.backend.Entity.Appointment;
import com.doctime.backend.Service.QueueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/queue")
public class QueueController {

    @Autowired
    private QueueService queueService; // Using the Service now!

    // 1. Receptionist iPad: View the live line of patients
    @GetMapping("/{doctorId}")
    public ResponseEntity<List<Appointment>> getLiveQueue(@PathVariable Long doctorId) {
        return ResponseEntity.ok(queueService.getLiveQueue(doctorId));
    }

    // 2. Receptionist iPad: Click "Check In" when patient walks through the door
    @PutMapping("/checkin/{appointmentId}")
    public ResponseEntity<?> markPatientArrived(@PathVariable Long appointmentId) {
        try {
            Appointment updatedAppt = queueService.markPatientArrived(appointmentId);
            return ResponseEntity.ok(updatedAppt);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 3. Doctor iPad: Click "Done" when the consultation is finished
    @PreAuthorize("hasRole('DOCTOR')")
    @PutMapping("/complete/{appointmentId}")
    public ResponseEntity<?> completeAppointment(@PathVariable Long appointmentId) {
        try {
            Appointment completedAppt = queueService.completeAppointment(appointmentId);
            return ResponseEntity.ok(completedAppt);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}