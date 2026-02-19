package com.doctime.backend.Repo;

import com.doctime.backend.Entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface AppointmentRepo extends JpaRepository<Appointment, Long> {

    // 1. Get all appointments for a specific doctor
    List<Appointment> findByDoctorId(Long doctorId);

    // 2. Get all appointments for a specific patient
    List<Appointment> findByPatientId(Long patientId);

    // 3. Find the LATEST appointment time for a specific doctor
    // (We use this to calculate the NEXT slot)
    @Query("SELECT MAX(a.appointmentTime) FROM Appointment a WHERE a.doctor.id = :doctorId")
    LocalDateTime findLastAppointmentTimeByDoctor(Long doctorId);

    @Query("SELECT a FROM Appointment a " +
            "WHERE a.doctor.id = :doctorId " +
            "AND a.status IN ('BOOKED', 'CHECKED_IN', 'IN_PROGRESS') " +
            "ORDER BY " +
            "CASE WHEN a.status = 'IN_PROGRESS' THEN 1 " +  // Current patient FIRST
            "     WHEN a.status = 'CHECKED_IN' THEN 2 " +   // Waiting patients SECOND
            "     ELSE 3 END, " +                           // Late/Future patients LAST
            "a.appointmentTime ASC")                        // Tie-breaker: Who was scheduled first?
    List<Appointment> getLiveQueue(Long doctorId);

    Long countByDoctorIdAndStatusIn(Long doctorId, List<String> statuses);

}