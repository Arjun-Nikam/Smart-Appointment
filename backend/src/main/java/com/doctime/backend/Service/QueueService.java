package com.doctime.backend.Service;

import com.doctime.backend.Entity.Appointment;
import com.doctime.backend.Repo.AppointmentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class QueueService {

    @Autowired
    private AppointmentRepo appointmentRepo;

    // 1. Get the Live Queue
    public List<Appointment> getLiveQueue(Long doctorId) {
        return appointmentRepo.getLiveQueue(doctorId);
    }

    // 2. Mark Patient Arrived (SECURED)
    public Appointment markPatientArrived(Long appointmentId, String loggedInDoctorEmail) {
        Appointment appt = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // 🛑 SECURITY CHECK: Does this appointment belong to the logged-in doctor?
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
}