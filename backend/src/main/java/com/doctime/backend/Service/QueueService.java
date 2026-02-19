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

    // 1. Get the Live Queue for the Doctor
    public List<Appointment> getLiveQueue(Long doctorId) {
        return appointmentRepo.getLiveQueue(doctorId);
    }

    // 2. Mark Patient Arrived
    public Appointment markPatientArrived(Long appointmentId) {
        Appointment appt = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appt.setStatus("CHECKED_IN");
        appt.setActualArrivalTime(LocalDateTime.now());

        return appointmentRepo.save(appt);
    }

    // 3. Complete Appointment
    public Appointment completeAppointment(Long appointmentId) {
        Appointment appt = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appt.setStatus("COMPLETED");

        return appointmentRepo.save(appt);
    }
}