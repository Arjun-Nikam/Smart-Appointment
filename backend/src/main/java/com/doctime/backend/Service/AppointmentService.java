package com.doctime.backend.Service;

import com.doctime.backend.Entity.Appointment;
import com.doctime.backend.Entity.Doctor;
import com.doctime.backend.Entity.Patient;
import com.doctime.backend.Entity.Shift;
import com.doctime.backend.Repo.AppointmentRepo;
import com.doctime.backend.Repo.DoctorRepo;
import com.doctime.backend.Repo.PatientRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;

@Service
public class AppointmentService {

    @Autowired private AppointmentRepo appointmentRepo;
    @Autowired private DoctorRepo doctorRepo;
    @Autowired private PatientRepo patientRepo;

    private static final int MAX_QUEUE_SIZE = 30;

    @Transactional
    public Appointment bookAppointment(Long patientId, Long doctorId) {

        // Pessimistic lock — prevents race condition on simultaneous bookings
        Doctor doctor = doctorRepo.findByIdWithLock(doctorId)
                .orElseThrow(() -> new RuntimeException("Invalid credentials."));

        Patient patient = patientRepo.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Invalid credentials."));

        // 1. Availability check
        if (!doctor.isAvailable()) {
            throw new RuntimeException(doctor.getName() + " is not taking appointments.");
        }

        // 2. Shift hours check
        LocalTime now = LocalTime.now();
        boolean isWithinShift = doctor.getShifts() != null && doctor.getShifts().stream()
                .anyMatch(s -> !now.isBefore(s.getStartTime()) && !now.isAfter(s.getEndTime()));

        if (doctor.getShifts() != null && !doctor.getShifts().isEmpty() && !isWithinShift) {
            throw new RuntimeException(doctor.getName() + " is outside working hours.");
        }

        // 3. FIX #1: Duplicate booking guard — was missing, repo query never called
        Long alreadyBooked = appointmentRepo.countActiveTodayForPatientAndDoctor(
                doctorId, patientId, LocalDate.now()
        );
        if (alreadyBooked > 0) {
            throw new RuntimeException("You already have an active booking with this doctor today.");
        }

        // 4. Queue size cap
        List<String> activeStatuses = List.of("BOOKED", "CHECKED_IN", "IN_PROGRESS");
        long currentQueueSize = appointmentRepo.countByDoctorIdAndStatusIn(doctorId, activeStatuses);

        if (currentQueueSize >= MAX_QUEUE_SIZE) {
            throw new RuntimeException("Queue is full for today. Please try tomorrow.");
        }

        // 5. Calculate next slot time
        LocalDateTime lastSlotTime = appointmentRepo
                .findLastScheduledTimeByDoctorForToday(doctorId, LocalDate.now());

        LocalDateTime newSlotTime;
        if (lastSlotTime == null) {
            // FIX #2: Filter to the CURRENTLY ACTIVE shift only
            // Old code used !now.isBefore(startTime) which matched ANY past shift,
            // e.g. 9 AM shift would wrongly anchor a 6 PM first-patient slot to 9:00
            LocalTime shiftStart = doctor.getShifts().stream()
                    .filter(s -> !now.isBefore(s.getStartTime()) && !now.isAfter(s.getEndTime()))
                    .map(Shift::getStartTime)
                    .min(Comparator.naturalOrder())
                    .orElse(now); // fallback: use current time if no shift matched

            newSlotTime = LocalDate.now().atTime(shiftStart);
        } else {
            newSlotTime = lastSlotTime.plusMinutes(doctor.getAverageConsultationTime());
        }

        // 6. Build and save
        Appointment appt = new Appointment();
        appt.setPatient(patient);
        appt.setDoctor(doctor);
        appt.setAppointmentTime(newSlotTime);
        appt.setStatus("BOOKED");
        appt.setQueuePosition((int) currentQueueSize + 1);

        return appointmentRepo.save(appt);
    }

    @Transactional
    public Appointment cancelAppointment(Long appointmentId, String loggedInPatientEmail) {

        Appointment appt = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appt.getPatient().getEmail().equals(loggedInPatientEmail)) {
            throw new RuntimeException("Unauthorized: You can only cancel your own appointments.");
        }

        if (!appt.getStatus().equals("BOOKED")) {
            throw new RuntimeException("Cannot cancel an appointment with status: " + appt.getStatus());
        }

        appt.setStatus("CANCELLED");
        appointmentRepo.save(appt);

        // Single bulk UPDATE — replaces the old O(n) loop
        appointmentRepo.shiftQueueForward(
                appt.getDoctor().getId(),
                appt.getAppointmentTime(),
                appt.getDoctor().getAverageConsultationTime()
        );

        return appt;
    }

    public List<Appointment> getPatientHistory(String loggedInPatientEmail) {
        Patient patient = patientRepo.findByEmail(loggedInPatientEmail)
                .orElseThrow(() -> new RuntimeException("Invalid credentials."));
        return appointmentRepo.findByPatientIdOrderByAppointmentTimeDesc(patient.getId());
    }
}