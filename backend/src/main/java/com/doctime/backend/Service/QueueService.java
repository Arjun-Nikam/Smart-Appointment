package com.doctime.backend.Service;

import com.doctime.backend.Entity.Appointment;
import com.doctime.backend.Repo.AppointmentRepo;
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

    // 1. Get the Live Queue
    public List<Appointment> getLiveQueue(Long doctorId) {
        return appointmentRepo.getLiveQueue(doctorId, LocalDate.now());
    }

    // 2. Mark Patient Arrived (SECURED)
    public Appointment markPatientArrived(Long appointmentId, String loggedInDoctorEmail) {
        Appointment appt = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        //  SECURITY CHECK: Does this appointment belong to the logged-in doctor?
        if (!appt.getDoctor().getEmail().equals(loggedInDoctorEmail)) {
            throw new RuntimeException("Unauthorized: You cannot modify another doctor's queue!");
        }

        appt.setStatus("CHECKED_IN");
        appt.setActualArrivalTime(LocalDateTime.now());

        return appointmentRepo.save(appt);
    }

    // 3. Complete Appointment (SECURED)
    public Appointment completeAppointment(Long appointmentId, String loggedInDoctorEmail) {
        Appointment appt = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // 🛑 SECURITY CHECK: Does this appointment belong to the logged-in doctor?
        if (!appt.getDoctor().getEmail().equals(loggedInDoctorEmail)) {
            throw new RuntimeException("Unauthorized: You cannot modify another doctor's queue!");
        }

        appt.setStatus("COMPLETED");

        return appointmentRepo.save(appt);
    }

    // 4. Receptionist iPad: Mark a late patient as a No-Show
    public Appointment markNoShow(Long appointmentId, String loggedInDoctorEmail) {
        Appointment appt = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appt.getDoctor().getEmail().equals(loggedInDoctorEmail)) {
            throw new RuntimeException("Unauthorized: Cannot modify another doctor's queue!");
        }

        if (!appt.getStatus().equals("BOOKED")) {
            throw new RuntimeException("Can only mark BOOKED patients as No-Show.");
        }

        // 1. Mark them as NO_SHOW (this hides them from the active queue)
        appt.setStatus("NO_SHOW");
        appointmentRepo.save(appt);

        // 2. 🚀 CASCADING UPDATE: Shift everyone else forward!
        List<Appointment> upcomingAppts = appointmentRepo.findUpcomingAppointments(
                appt.getDoctor().getId(),
                appt.getAppointmentTime()
        );

        long minutesToMove = appt.getDoctor().getAverageConsultationTime();

        for (Appointment upcoming : upcomingAppts) {
            upcoming.setAppointmentTime(upcoming.getAppointmentTime().minusMinutes(minutesToMove));
            if (upcoming.getQueuePosition() != null && upcoming.getQueuePosition() > 1) {
                upcoming.setQueuePosition(upcoming.getQueuePosition() - 1);
            }
        }

        appointmentRepo.saveAll(upcomingAppts);

        return appt;
    }

    public Map<String, Object> getPatientQueuePosition(Long appointmentId, String patientEmail) {

        Appointment appt = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Security check — only the owner can see their position
        if (!appt.getPatient().getEmail().equals(patientEmail)) {
            throw new RuntimeException("Unauthorized: This is not your appointment.");
        }

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