package com.doctime.backend.Service;

import com.doctime.backend.Entity.Appointment;
import org.springframework.transaction.annotation.Transactional;
import com.doctime.backend.Entity.Patient;
import com.doctime.backend.Repo.AppointmentRepo;
import com.doctime.backend.Repo.PatientRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class QueueService {

    @Autowired
    private AppointmentRepo appointmentRepo;

    // FIX #3: Was missing — needed for getPatientQueuePosition
    @Autowired
    private PatientRepo patientRepo;

    // 1. Get the Live Queue (Doctor)
    public List<Appointment> getLiveQueue(Long doctorId) {
        return appointmentRepo.getLiveQueue(doctorId, LocalDate.now());
    }

    // 2. Mark Patient Arrived (Doctor)
    @Transactional
    public Appointment markPatientArrived(Long appointmentId, String loggedInDoctorEmail) {
        Appointment appt = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appt.getDoctor().getEmail().equals(loggedInDoctorEmail)) {
            throw new RuntimeException("Unauthorized: You cannot modify another doctor's queue!");
        }
        if (!appt.getStatus().equals("BOOKED")) {
            throw new RuntimeException("Cannot check in appointment with status: "
                    + appt.getStatus());
        }

        appt.setStatus("CHECKED_IN");
        appt.setActualArrivalTime(LocalDateTime.now());
        appt.setLateArrival(false); // FIX #2: reset flag on normal checkin

        return appointmentRepo.save(appt);
    }

    // 3. Complete Appointment (Doctor)
    @Transactional
    public Appointment completeAppointment(Long appointmentId, String loggedInDoctorEmail) {
        Appointment appt = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appt.getDoctor().getEmail().equals(loggedInDoctorEmail)) {
            throw new RuntimeException("Unauthorized: You cannot modify another doctor's queue!");
        }

        appt.setStatus("COMPLETED");
        return appointmentRepo.save(appt);
    }

    // 4. Mark No Show (Doctor)
    private static final int GRACE_PERIOD_MINUTES = 0; // Configurable

    @Transactional
    public Appointment markNoShow(Long appointmentId, String loggedInDoctorEmail) {
        Appointment appt = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appt.getDoctor().getEmail().equals(loggedInDoctorEmail)) {
            throw new RuntimeException("Unauthorized: Cannot modify another doctor's queue!");
        }

        if (!appt.getStatus().equals("BOOKED")) {
            throw new RuntimeException("Can only mark BOOKED patients as No-Show.");
        }

        // ── GRACE PERIOD CHECK ─────────────────────────────────────────
        // Calculate when the grace period expires
        LocalDateTime graceDeadline = appt.getAppointmentTime()
                .plusMinutes(GRACE_PERIOD_MINUTES);

        // If current time is still within grace period, block the action
        if (LocalDateTime.now().isBefore(graceDeadline)) {
            long minutesLeft = java.time.Duration.between(
                    LocalDateTime.now(), graceDeadline).toMinutes() + 1;
            throw new RuntimeException(
                    "Patient still has " + minutesLeft + " minute(s) grace period remaining. " +
                            "Please wait before marking as No-Show."
            );
        }
        // ──────────────────────────────────────────────────────────────

        appt.setStatus("NO_SHOW");
        appointmentRepo.save(appt);

        // Bulk shift queue forward
        appointmentRepo.shiftQueueForward(
                appt.getDoctor().getId(),
                appt.getAppointmentTime(),
                appt.getDoctor().getAverageConsultationTime()
        );

        return appt;
    }

    @Transactional
    public Map<String, Object> swapWithNextPresent(
            Long lateAppointmentId, String loggedInDoctorEmail) {

        // 1. Get the late patient's appointment
        Appointment lateAppt = appointmentRepo.findById(lateAppointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!lateAppt.getDoctor().getEmail().equals(loggedInDoctorEmail)) {
            throw new RuntimeException("Unauthorized.");
        }

        if (!lateAppt.getStatus().equals("BOOKED")) {
            throw new RuntimeException("Can only swap a BOOKED (not yet arrived) patient.");
        }

        // 2. Grace period check — don't swap too early
        LocalDateTime graceDeadline = lateAppt.getAppointmentTime()
                .plusMinutes(GRACE_PERIOD_MINUTES);

        if (LocalDateTime.now().isBefore(graceDeadline)) {
            long minutesLeft = Duration.between(
                    LocalDateTime.now(), graceDeadline).toMinutes() + 1;
            throw new RuntimeException(
                    "Grace period active. " + minutesLeft + " minute(s) remaining."
            );
        }

        // 3. Find the FIRST CHECKED_IN patient after this position
        // (not blindly position+1 — they might also be absent)
        Appointment presentPatient = appointmentRepo
                .findFirstCheckedInAfterPosition(
                        lateAppt.getDoctor().getId(),
                        lateAppt.getQueuePosition(),
                        LocalDate.now()
                )
                .orElseThrow(() -> new RuntimeException(
                        "No checked-in patients found to swap with. " +
                                "Please wait or mark as No-Show."
                ));

        // 4. THE SWAP — exchange their times and positions
        LocalDateTime lateTime        = lateAppt.getAppointmentTime();
        int           latePosition    = lateAppt.getQueuePosition();

        LocalDateTime presentTime     = presentPatient.getAppointmentTime();
        int           presentPosition = presentPatient.getQueuePosition();

        // Give the present patient the earlier slot
        presentPatient.setAppointmentTime(lateTime);
        presentPatient.setQueuePosition(latePosition);

        // Give the late patient the later slot
        lateAppt.setAppointmentTime(presentTime);
        lateAppt.setQueuePosition(presentPosition);
        lateAppt.setLateArrival(true);

        appointmentRepo.save(lateAppt);
        appointmentRepo.save(presentPatient);

        return Map.of(
                "message", "Swap successful",
                "calledNow", Map.of(
                        "patientName", presentPatient.getPatient().getName(),
                        "newSlot", lateTime,
                        "newPosition", latePosition
                ),
                "swappedTo", Map.of(
                        "patientName", lateAppt.getPatient().getName(),
                        "newSlot", presentTime,
                        "newPosition", presentPosition
                )
        );
    }

    // 5. Patient Views Their Queue Position (Patient)
    // FIX #1: Added missing method — no appointmentId needed, resolved from token
    public Map<String, Object> getPatientQueuePosition(String patientEmail) {

        // Find patient from their JWT email
        Patient patient = patientRepo.findByEmail(patientEmail)
                .orElseThrow(() -> new RuntimeException("Patient not found."));

        // Find their active appointment for today automatically
        Appointment appt = appointmentRepo.findActiveAppointmentForPatientToday(
                patient.getId(), LocalDate.now()
        ).orElseThrow(() -> new RuntimeException("You have no active appointment today."));

        // Count how many patients are ahead in the queue
        long patientsAhead = appointmentRepo.countPatientsAhead(
                appt.getDoctor().getId(),
                appt.getQueuePosition(),
                LocalDate.now()
        );

        return Map.of(
                "appointmentId", appt.getId(),
                "yourQueuePosition", appt.getQueuePosition(),
                "patientsAhead", patientsAhead,
                "estimatedWaitMinutes", patientsAhead * appt.getDoctor().getAverageConsultationTime(),
                "appointmentTime", appt.getAppointmentTime(),
                "status", appt.getStatus(),
                "doctorName", appt.getDoctor().getName(),
                "hospitalName", appt.getDoctor().getHospitalName(),
                "isLateArrival", appt.isLateArrival()
        );
    }
}
