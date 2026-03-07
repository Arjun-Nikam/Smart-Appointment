package com.doctime.backend.Controller;

import com.doctime.backend.Dto.AppointmentRequest;
import com.doctime.backend.Entity.Appointment;
import com.doctime.backend.Entity.Patient;
import com.doctime.backend.Service.AppointmentService;
import com.doctime.backend.Service.PatientService;
import jakarta.validation.Valid;
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
    public ResponseEntity<?> bookAppointment(

            @Valid @RequestBody AppointmentRequest request,
            Principal principal) {
        try {
            // Identity comes from the JWT token — never trust the request body for this
            String userEmail = principal.getName();
            Patient loggedInPatient = patientService.getPatientByEmail(userEmail);

            Appointment saved = appointmentService.bookAppointment(
                    loggedInPatient.getId(),
                    request.getDoctorId()
            );

            return ResponseEntity.ok(saved);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @PreAuthorize("hasRole('PATIENT')")
    @DeleteMapping("/cancel/{appointmentId}")
    public ResponseEntity<?> cancelAppointment(
            @PathVariable Long appointmentId,
            Principal principal) {
        try {
            String patientEmail = principal.getName();
            Appointment cancelled = appointmentService.cancelAppointment(appointmentId, patientEmail);
            return ResponseEntity.ok(cancelled);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 3. Patient App: View all upcoming and past appointments
    @PreAuthorize("hasRole('PATIENT')")
    @GetMapping("/my-history")
    public ResponseEntity<?> getMyHistory(Principal principal) {
        try {
            String patientEmail = principal.getName();
            List<Appointment> history = appointmentService.getPatientHistory(patientEmail);
            return ResponseEntity.ok(history);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}