package com.doctime.backend.Repo;

import com.doctime.backend.Entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepo extends JpaRepository<Appointment, Long> {

    // ─────────────────────────────────────────────
    // BASIC FINDERS
    // ─────────────────────────────────────────────

    List<Appointment> findByDoctorId(Long doctorId);

    List<Appointment> findByPatientId(Long patientId);

    List<Appointment> findByPatientIdOrderByAppointmentTimeDesc(Long patientId);

    // ─────────────────────────────────────────────
    // BOOKING LOGIC
    // ─────────────────────────────────────────────

    // FIX #1: Removed old findLastAppointmentTimeByDoctor entirely
    // This replaces it — scoped to today + active statuses only
    @Query("SELECT MAX(a.appointmentTime) FROM Appointment a " +
            "WHERE a.doctor.id = :doctorId " +
            "AND a.status IN ('BOOKED', 'CHECKED_IN', 'IN_PROGRESS') " +
            "AND CAST(a.appointmentTime AS date) = :today")
    LocalDateTime findLastScheduledTimeByDoctorForToday(
            @Param("doctorId") Long doctorId,
            @Param("today") LocalDate today
    );

    // FIX #2: Duplicate booking guard — was missing, patients could book multiple times
    @Query("SELECT COUNT(a) FROM Appointment a " +
            "WHERE a.doctor.id = :doctorId " +
            "AND a.patient.id = :patientId " +
            "AND a.status IN ('BOOKED', 'CHECKED_IN', 'IN_PROGRESS') " +
            "AND CAST(a.appointmentTime AS date) = :today")
    Long countActiveTodayForPatientAndDoctor(
            @Param("doctorId") Long doctorId,
            @Param("patientId") Long patientId,
            @Param("today") LocalDate today
    );

    // Derived query — no @Param needed here, Spring resolves by position
    Long countByDoctorIdAndStatusIn(Long doctorId, List<String> statuses);

    // ─────────────────────────────────────────────
    // LIVE QUEUE
    // ─────────────────────────────────────────────

    // FIX #3: Added @Param + today date filter — was showing ghost appointments
    @Query("SELECT a FROM Appointment a " +
            "WHERE a.doctor.id = :doctorId " +
            "AND a.status IN ('BOOKED', 'CHECKED_IN', 'IN_PROGRESS') " +
            "AND CAST(a.appointmentTime AS date) = :today " +
            "ORDER BY " +
            "CASE WHEN a.status = 'IN_PROGRESS' THEN 1 " +
            "     WHEN a.status = 'CHECKED_IN'  THEN 2 " +
            "     ELSE 3 END, " +
            "a.appointmentTime ASC")
    List<Appointment> getLiveQueue(
            @Param("doctorId") Long doctorId,
            @Param("today") LocalDate today
    );

    // ─────────────────────────────────────────────
    // CANCEL / NO-SHOW CASCADE
    // ─────────────────────────────────────────────

    // FIX #4: Added @Param + included CHECKED_IN (they're in queue too)
    @Query("SELECT a FROM Appointment a " +
            "WHERE a.doctor.id = :doctorId " +
            "AND a.status IN ('BOOKED', 'CHECKED_IN') " +
            "AND a.appointmentTime > :cancelledTime " +
            "ORDER BY a.appointmentTime ASC")
    List<Appointment> findUpcomingAppointments(
            @Param("doctorId") Long doctorId,
            @Param("cancelledTime") LocalDateTime cancelledTime
    );

    // FIX #5: Switched to nativeQuery = true
    // JPQL does NOT support date arithmetic like "- :minutes MINUTE"
    // Native SQL does — this is the correct approach
    @Modifying
    @Transactional
    @Query(value = "UPDATE appointments SET " +
            "appointment_time = appointment_time - (:minutes * INTERVAL '1 minute'), " +
            "queue_position = queue_position - 1 " +
            "WHERE doctor_id = :doctorId " +
            "AND appointment_time > :afterTime " +
            "AND status IN ('BOOKED', 'CHECKED_IN')",
            nativeQuery = true)
    void shiftQueueForward(
            @Param("doctorId") Long doctorId,
            @Param("afterTime") LocalDateTime afterTime,
            @Param("minutes") long minutes
    );

    // Find first CHECKED_IN patient AFTER a given queue position
// This handles the case where multiple patients are absent
    @Query("SELECT a FROM Appointment a " +
            "WHERE a.doctor.id = :doctorId " +
            "AND a.status = 'CHECKED_IN' " +
            "AND a.queuePosition > :afterPosition " +
            "AND CAST(a.appointmentTime AS date) = :today " +
            "ORDER BY a.queuePosition ASC")
    Optional<Appointment> findFirstCheckedInAfterPosition(
            @Param("doctorId") Long doctorId,
            @Param("afterPosition") int afterPosition,
            @Param("today") LocalDate today
    );

    // Mark all BOOKED or CHECKED_IN appointments from BEFORE today as NO_SHOW
    @Modifying
    @Query("UPDATE Appointment a SET a.status = 'NO_SHOW' " +
            "WHERE a.status IN ('BOOKED', 'CHECKED_IN') " +
            "AND CAST(a.appointmentTime AS date) < CURRENT_DATE")
    int markExpiredAppointmentsNoShow();



    // Find patient's active appointment for today automatically
    @Query("SELECT a FROM Appointment a " +
            "WHERE a.patient.id = :patientId " +
            "AND a.status IN ('BOOKED', 'CHECKED_IN') " +
            "AND CAST(a.appointmentTime AS date) = :today")
    Optional<Appointment> findActiveAppointmentForPatientToday(
            @Param("patientId") Long patientId,
            @Param("today") LocalDate today
    );

    // Count how many patients are ahead in the queue
    @Query("SELECT COUNT(a) FROM Appointment a " +
            "WHERE a.doctor.id = :doctorId " +
            "AND a.status IN ('BOOKED', 'CHECKED_IN', 'IN_PROGRESS') " +
            "AND a.queuePosition < :myPosition " +
            "AND CAST(a.appointmentTime AS date) = :today")
    Long countPatientsAhead(
            @Param("doctorId") Long doctorId,
            @Param("myPosition") int myPosition,
            @Param("today") LocalDate today
    );

    // Count only CHECKED_IN patients ahead — physically present only
    @Query("SELECT COUNT(a) FROM Appointment a " +
            "WHERE a.doctor.id = :doctorId " +
            "AND a.status = 'CHECKED_IN' " +
            "AND a.queuePosition < :myPosition " +
            "AND CAST(a.appointmentTime AS date) = :today")
    Long countCheckedInPatientsAhead(
            @Param("doctorId") Long doctorId,
            @Param("myPosition") int myPosition,
            @Param("today") LocalDate today
    );
}