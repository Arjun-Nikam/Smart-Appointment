package com.doctime.backend.Entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity // Tells Hibernate: "Make a table for this class"
@Table(name = "patients") // Names the table "patients" in Postgres
@Data // Lombok: Generates Getters, Setters, toString, etc.
@NoArgsConstructor // Lombok: Generates empty constructor
@AllArgsConstructor // Lombok: Generates full constructor
public class Patient {

    @Id // Primary Key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment (1, 2, 3...)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, length = 10)
    private String phoneNumber;

    private String age;

    private String gender;

    // We will add medical history later as a JSONB type!
}
