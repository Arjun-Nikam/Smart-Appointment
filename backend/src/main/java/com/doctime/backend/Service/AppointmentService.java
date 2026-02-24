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

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepo appointmentRepo;

    @Autowired
    private DoctorRepo doctorRepo;

    @Autowired
    private PatientRepo patientRepo;

    // This is the main method called when someone clicks "Book Now"
    public Appointment bookAppointment(Long patientId, Long doctorId) {


        // 1. Fetch the Patient and Doctor from the DB
        // (Throw an error if they don't exist)
        Patient patient = patientRepo.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found!"));

        Doctor doctor = doctorRepo.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found!"));

        //  Is the doctor actually taking patients?
        if (!doctor.isAvailable()) {
            throw new RuntimeException("Sorry! " + doctor.getName() + " is currently offline and not taking appointments.");
        }
//        Is the current time outside of their shift hours?
        LocalTime now = LocalTime.now();
        boolean isWithinShift = false;
        if (doctor.getShifts() != null && !doctor.getShifts().isEmpty()) {
            for (Shift shift : doctor.getShifts()) {
                // If 'now' is AFTER the start time AND BEFORE the end time
                if (!now.isBefore(shift.getStartTime()) && !now.isAfter(shift.getEndTime())) {
                    isWithinShift = true;
                    break; // We found a valid shift, stop checking!
                }
            }

            if (!isWithinShift) {
                throw new RuntimeException("Sorry! " + doctor.getName() + " is currently outside of their working shifts.");
            }
        }

        // 2. Calculate the Appointment Time
        // We ask the Repo: "When is this doctor free next?"
        LocalDateTime lastAppointmentTime = appointmentRepo.findLastAppointmentTimeByDoctor(doctorId);

        LocalDateTime newSlotTime;

        if (lastAppointmentTime == null) {
            // Case A: This is the very first patient of the day
            newSlotTime = LocalDateTime.now(); // Or set a specific start time like 9:00 AM
        } else {
            // Case B: There is a queue. Add the doctor's average time to the last slot.
            // Example: Last slot was 10:00. Avg time is 15 mins. New slot = 10:15.
            newSlotTime = lastAppointmentTime.plusMinutes(doctor.getAverageConsultationTime());
        }

        // 3. Create the Appointment Object
        Appointment newAppointment = new Appointment();
        newAppointment.setPatient(patient);
        newAppointment.setDoctor(doctor);
        newAppointment.setAppointmentTime(newSlotTime);
        newAppointment.setStatus("BOOKED");

        List<String> activeStatuses = Arrays.asList("BOOKED", "CHECKED_IN", "IN_PROGRESS");
        Long currentQueueSize = appointmentRepo.countByDoctorIdAndStatusIn(doctorId, activeStatuses);

        newAppointment.setQueuePosition(currentQueueSize.intValue() + 1);
        // 4. Save to Database
        return appointmentRepo.save(newAppointment);
    }

    public List<Appointment> getPatientHistory(Long patientId) {
        return appointmentRepo.findByPatientId(patientId);
    }

    public Appointment cancelAppointment(Long appointmentId, String loggedInPatientEmail) {
        Appointment appt = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appt.getPatient().getEmail().equals(loggedInPatientEmail)) {
            throw new RuntimeException("Unauthorized: You can only cancel your own appointments!");
        }

        if (!appt.getStatus().equals("BOOKED")) {
            throw new RuntimeException("Cannot cancel an appointment that is already " + appt.getStatus());
        }

        // 1. Mark the current one as cancelled
        appt.setStatus("CANCELLED");
        appointmentRepo.save(appt);

        // --- THE CASCADING QUEUE UPDATE ---

        // 2. Find everyone waiting behind this cancelled patient
        List<Appointment> upcomingAppts = appointmentRepo.findUpcomingAppointments(
                appt.getDoctor().getId(),
                appt.getAppointmentTime()
        );

        // 3. How much time do we need to shift them by?
        long minutesToMove = appt.getDoctor().getAverageConsultationTime();

        // 4. Loop through and move everyone forward!
        for (Appointment upcoming : upcomingAppts) {

            // Shift the clock forward (subtract the minutes)
            upcoming.setAppointmentTime(upcoming.getAppointmentTime().minusMinutes(minutesToMove));

            // Shift the queue line forward (subtract 1)
            if (upcoming.getQueuePosition() != null && upcoming.getQueuePosition() > 1) {
                upcoming.setQueuePosition(upcoming.getQueuePosition() - 1);
            }
        }

        // 5. Save the entire updated list back to the database in one batch
        appointmentRepo.saveAll(upcomingAppts);

        return appt;
    }

    // 5. Get Patient History (SECURED)
    public List<Appointment> getPatientHistory(String loggedInPatientEmail) {

        // 1. Find the exact patient in the database using their secure token email
        Patient patient = patientRepo.findByEmail(loggedInPatientEmail)
                .orElseThrow(() -> new RuntimeException("Patient profile not found."));

        // 2. Fetch and return their sorted history
        return appointmentRepo.findByPatientIdOrderByAppointmentTimeDesc(patient.getId());
    }



}