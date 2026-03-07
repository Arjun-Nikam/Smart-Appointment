package com.doctime.backend.Dto;

import lombok.Data;

@Data
public class AppointmentRequest {

    private Long doctorId;


    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }
}