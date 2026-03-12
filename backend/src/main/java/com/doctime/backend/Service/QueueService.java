package com.doctime.backend.Service;

import com.doctime.backend.Entity.Appointment;
import com.doctime.backend.Entity.Patient;
import com.doctime.backend.Repo.AppointmentRepo;
import com.doctime.backend.Repo.PatientRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
    public Appointment markPatientArrived(Long appointmentId, String loggedInDoctorEmail) {
        Appointment appt = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appt.getDoctor().getEmail().equals(loggedInDoctorEmail)) {
            throw new RuntimeException("Unauthorized: You cannot modify another doctor's queue!");
        }

        appt.setStatus("CHECKED_IN");
        appt.setActualArrivalTime(LocalDateTime.now());

        return appointmentRepo.save(appt);
    }

    // 3. Complete Appointment (Doctor)
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
    public Appointment markNoShow(Long appointmentId, String loggedInDoctorEmail) {
        Appointment appt = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appt.getDoctor().getEmail().equals(loggedInDoctorEmail)) {
            throw new RuntimeException("Unauthorized: Cannot modify another doctor's queue!");
        }

        if (!appt.getStatus().equals("BOOKED")) {
            throw new RuntimeException("Can only mark BOOKED patients as No-Show.");
        }

        appt.setStatus("NO_SHOW");
        appointmentRepo.save(appt);

        // FIX #2: Replaced O(n) loop with single bulk UPDATE
        appointmentRepo.shiftQueueForward(
                appt.getDoctor().getId(),
                appt.getAppointmentTime(),
                appt.getDoctor().getAverageConsultationTime()
        );

        return appt;
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
                "hospitalName", appt.getDoctor().getHospitalName()
        );
    }
}
