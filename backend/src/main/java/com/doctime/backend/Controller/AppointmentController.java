package com.doctime.backend.Controller;

import com.doctime.backend.Dto.AppointmentRequest;
import com.doctime.backend.Entity.Appointment;
import com.doctime.backend.Service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @PostMapping("/book")
    public ResponseEntity<?> bookAppointment(@RequestBody AppointmentRequest request) {
        try {
            // We pull the IDs out of the JSON request object and pass them to your Service
            Appointment savedAppointment = appointmentService.bookAppointment(
                    request.getPatientId(),
                    request.getDoctorId()
            );
            return ResponseEntity.ok(savedAppointment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getPatientHistory(@PathVariable Long patientId) {
        try {
            List<Appointment> history = appointmentService.getPatientHistory(patientId);
            return ResponseEntity.ok(history);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}