package com.doctime.backend.Service;

import com.doctime.backend.Entity.Appointment;
import com.doctime.backend.Entity.Doctor;
import com.doctime.backend.Entity.Patient;
import com.doctime.backend.Repo.AppointmentRepo;
import com.doctime.backend.Repo.DoctorRepo;
import com.doctime.backend.Repo.PatientRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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


}