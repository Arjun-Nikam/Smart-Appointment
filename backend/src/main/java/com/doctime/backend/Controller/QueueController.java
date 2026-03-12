package com.doctime.backend.Controller;

import com.doctime.backend.Entity.Appointment;
import com.doctime.backend.Entity.Doctor;
import com.doctime.backend.Repo.DoctorRepo;
import com.doctime.backend.Service.QueueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/queue")
public class QueueController {

    @Autowired
    private QueueService queueService;

    @Autowired
    private DoctorRepo doctorRepo; // 👈 We need this to look up the logged-in doctor

    // 1. Receptionist iPad: View the live line of patients
    @PreAuthorize("hasRole('DOCTOR')")
    @GetMapping("/my-queue") // 👈 NO MORE ID IN THE URL.
    public ResponseEntity<List<Appointment>> getLiveQueue(Principal principal) {

        // Extract the doctor's email from their secure JWT token
        String email = principal.getName();

        // Find the doctor in the DB
        Doctor doctor = doctorRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        // Force the service to use the token's ID, not an ID from the URL
        return ResponseEntity.ok(queueService.getLiveQueue(doctor.getId()));
    }

    // 2. Receptionist iPad: Click "Check In" when patient walks through the door
    @PreAuthorize("hasRole('DOCTOR')")
    @PutMapping("/checkin/{appointmentId}")
    public ResponseEntity<?> markPatientArrived(@PathVariable Long appointmentId, Principal principal) {
        try {
            // Get the secure email from the token and pass it to the service
            String doctorEmail = principal.getName();
            Appointment updatedAppt = queueService.markPatientArrived(appointmentId, doctorEmail);
            return ResponseEntity.ok(updatedAppt);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 3. Doctor iPad: Click "Done"
    @PreAuthorize("hasRole('DOCTOR')")
    @PutMapping("/complete/{appointmentId}")
    public ResponseEntity<?> completeAppointment(@PathVariable Long appointmentId, Principal principal) {
        try {
            // Get the secure email from the token and pass it to the service
            String doctorEmail = principal.getName();
            Appointment completedAppt = queueService.completeAppointment(appointmentId, doctorEmail);
            return ResponseEntity.ok(completedAppt);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 4. Receptionist iPad: Click "No-Show" if patient is too late
    // 4. Receptionist iPad: Click "No-Show" if patient is too late
    @PreAuthorize("hasRole('DOCTOR')")
    @PutMapping("/noshow/{appointmentId}")
    public ResponseEntity<?> markPatientNoShow(@PathVariable Long appointmentId, Principal principal) {
        try {
            String doctorEmail = principal.getName();
            Appointment missedAppt = queueService.markNoShow(appointmentId, doctorEmail);
            return ResponseEntity.ok(missedAppt);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Patient App: See your position and how many are ahead of you
    // Patient App: See your position and how many are ahead of you
    @PreAuthorize("hasRole('PATIENT')")
    @GetMapping("/my-position")
    public ResponseEntity<?> getMyQueuePosition(Principal principal) {
        try {
            String patientEmail = principal.getName();
            return ResponseEntity.ok(queueService.getPatientQueuePosition(patientEmail));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @PutMapping("/swap/{lateAppointmentId}")
    public ResponseEntity<?> swapWithNextPresent(
            @PathVariable Long lateAppointmentId,
            Principal principal) {
        try {
            String doctorEmail = principal.getName();
            return ResponseEntity.ok(
                    queueService.swapWithNextPresent(lateAppointmentId, doctorEmail)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}