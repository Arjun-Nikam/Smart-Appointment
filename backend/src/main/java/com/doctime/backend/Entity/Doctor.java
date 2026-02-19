package com.doctime.backend.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalTime;


@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    @Setter
    @Getter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Getter
    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String specialization; // e.g., "Cardiologist", "General Physician"

    @Column(nullable = false)
    private String hospitalName; // or Clinic Name

    @Column(name = "avg_consultation_time")
    private Integer averageConsultationTime = 15;

    // To mark if the doctor is currently in the clinic
    private boolean isAvailable = true;


    @JsonIgnore
    @Column(nullable = false)
    private String password;
    // Add this right under private String name;
    @Column(nullable = false, unique = true)
    private String email;

    private Double latitude;
    private Double longitude;

    private LocalTime shiftStart;

    // The time they leave the hospital (e.g., 17:00)
    private LocalTime shiftEnd;

    @ElementCollection
    @CollectionTable(name = "doctor_shifts", joinColumns = @JoinColumn(name = "doctor_id"))
    private List<Shift> shifts = new ArrayList<>();


    public List<Shift> getShifts() {
        return shifts;
    }

    public void setShifts(List<Shift> shifts) {
        this.shifts = shifts;
    }

    public LocalTime getShiftStart() {
        return shiftStart;
    }

    public void setShiftStart(LocalTime shiftStart) {
        this.shiftStart = shiftStart;
    }

    public LocalTime getShiftEnd() {
        return shiftEnd;
    }

    public void setShiftEnd(LocalTime shiftEnd) {
        this.shiftEnd = shiftEnd;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public String getHospitalName() {
        return hospitalName;
    }

    public void setHospitalName(String hospitalName) {
        this.hospitalName = hospitalName;
    }

    public Integer getAverageConsultationTime() {
        return averageConsultationTime;
    }

    public void setAverageConsultationTime(Integer averageConsultationTime) {
        this.averageConsultationTime = averageConsultationTime;
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    public void setAvailable(boolean available) {
        isAvailable = available;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}