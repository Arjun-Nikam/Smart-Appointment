package com.doctime.backend.Entity;

import jakarta.persistence.*;
import lombok.*;


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

    // Add this to BOTH Patient.java and Doctor.java
    @Column(nullable = false)
    private String password;
    // Add this right under private String name;
    @Column(nullable = false, unique = true)
    private String email;

    private Double latitude;
    private Double longitude;

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