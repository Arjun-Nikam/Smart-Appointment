package com.doctime.backend.Controller;

import com.doctime.backend.Dto.AppointmentRequest;
import com.doctime.backend.Entity.Appointment;
import com.doctime.backend.Entity.Patient;
import com.doctime.backend.Repo.PatientRepo;
import com.doctime.backend.Service.AppointmentService;
import com.doctime.backend.Service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private PatientService patientService;

    @PreAuthorize("hasRole('PATIENT')")
    @PostMapping("/book")
    public ResponseEntity<?> bookAppointment(@RequestBody AppointmentRequest request, Principal principal) {
        try {
            String userEmail = principal.getName();

            // 👈 Call the Service instead of the Repo
            Patient loggedInPatient = patientService.getPatientByEmail(userEmail);

            Appointment savedAppointment = appointmentService.bookAppointment(
                    loggedInPatient.getId(),
                    request.getDoctorId()
            );

            return ResponseEntity.ok(savedAppointment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('PATIENT')")
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getPatientHistory(@PathVariable Long patientId) {
        try {
            List<Appointment> history = appointmentService.getPatientHistory(patientId);
            return ResponseEntity.ok(history);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('PATIENT')")
    @PutMapping("/cancel/{appointmentId}")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long appointmentId, Principal principal) {
        try {
            String patientEmail = principal.getName(); // Secure identity from token
            Appointment cancelledAppt = appointmentService.cancelAppointment(appointmentId, patientEmail);
            return ResponseEntity.ok(cancelledAppt);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}