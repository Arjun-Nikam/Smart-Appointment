package com.doctime.backend.Controller;

import com.doctime.backend.Entity.Appointment;
import com.doctime.backend.Repo.AppointmentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/queue")
public class QueueController {

    @Autowired
    private AppointmentRepo appointmentRepo;

    // 1. Get the Live Queue for the Doctor
    @GetMapping("/{doctorId}")
    public List<Appointment> getLiveQueue(@PathVariable Long doctorId) {
        // CORRECTED: Name matches the Repo interface now
        return appointmentRepo.getLiveQueue(doctorId);
    }

    // 2. Mark Patient Arrived
    @PutMapping("/checkin/{appointmentId}")
    public Appointment markPatientArrived(@PathVariable Long appointmentId) {
        Appointment appt = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appt.setStatus("CHECKED_IN");
        appt.setActualArrivalTime(LocalDateTime.now());
        return appointmentRepo.save(appt);
    }

    // 3. Complete Appointment
    @PutMapping("/complete/{appointmentId}")
    public Appointment completeAppointment(@PathVariable Long appointmentId) {
        Appointment appt = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appt.setStatus("COMPLETED");
        return appointmentRepo.save(appt);
    }
}