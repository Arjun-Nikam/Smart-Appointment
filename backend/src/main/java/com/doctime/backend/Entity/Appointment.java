package com.doctime.backend.Entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // RELATIONS: Many Appointments belong to One Doctor
    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    // RELATIONS: Many Appointments belong to One Patient
    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    // The scheduled time (e.g., 2026-02-05 10:30:00)
    @Column(nullable = false)
    private LocalDateTime appointmentTime;

    // Status: BOOKED, CHECKED_IN, COMPLETED, CANCELLED
    // We use String for simplicity now, but Enums are better later
    private String status = "BOOKED";

    // QUEUE LOGIC:
    // This tells the patient "You are #5 in line"
    private Integer queuePosition;

    // PREDICTION LOGIC:
    // If the AI predicts a delay, we update this field (in minutes)
    private Integer predictedDelay = 0;

    // We record exactly when they stepped into the hospital
    private LocalDateTime actualArrivalTime;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public LocalDateTime getAppointmentTime() {
        return appointmentTime;
    }

    public void setAppointmentTime(LocalDateTime appointmentTime) {
        this.appointmentTime = appointmentTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getPredictedDelay() {
        return predictedDelay;
    }

    public void setPredictedDelay(Integer predictedDelay) {
        this.predictedDelay = predictedDelay;
    }

    public Integer getQueuePosition() {
        return queuePosition;
    }

    public void setQueuePosition(Integer queuePosition) {
        this.queuePosition = queuePosition;
    }

    public LocalDateTime getActualArrivalTime() {
        return actualArrivalTime;
    }

    public void setActualArrivalTime(LocalDateTime actualArrivalTime) {
        this.actualArrivalTime = actualArrivalTime;
    }
}
