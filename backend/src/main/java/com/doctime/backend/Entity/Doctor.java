package com.doctime.backend.Entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String specialization; // e.g., "Cardiologist", "General Physician"

    @Column(nullable = false)
    private String hospitalName; // or Clinic Name

    // Crucial for your Smart Queue Algorithm
    // We store this in "Minutes" (e.g., 15, 20, 30)
    @Column(name = "avg_consultation_time")
    private Integer averageConsultationTime = 15;

    // To mark if the doctor is currently in the clinic
    private boolean isAvailable = true;
}