package com.doctime.backend.Dto;

import jakarta.validation.constraints.*;

public class DoctorSignupRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Specialization is required")
    private String specialization;

    @NotBlank(message = "Hospital name is required")
    private String hospitalName;

    @Min(value = 1, message = "Consultation time must be at least 1 minute")
    @Max(value = 120, message = "Consultation time cannot exceed 120 minutes")
    private Integer averageConsultationTime = 15;

    // Password pattern validated HERE on raw input — before hashing
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).*$",
            message = "Password must contain at least one uppercase letter, one number, and one special character"
    )
    private String password;

    private Double latitude;
    private Double longitude;

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

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }

    public Integer getAverageConsultationTime() { return averageConsultationTime; }
    public void setAverageConsultationTime(Integer averageConsultationTime) { this.averageConsultationTime = averageConsultationTime; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}