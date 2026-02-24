package com.doctime.backend.Service;

import com.doctime.backend.Dto.ScheduleUpdateRequest;
import com.doctime.backend.Entity.Doctor;
import com.doctime.backend.Repo.DoctorRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepo doctorRepo;

    public List<Doctor> getAllDoctors() {
        return doctorRepo.findAll();
    }

    public List<Doctor> getDoctorsBySpecialty(String specialty) {
        return doctorRepo.findBySpecializationIgnoreCase(specialty);
    }

    public List<Doctor> searchDoctorByName(String name) {
        return doctorRepo.findByNameContainingIgnoreCase(name);
    }

    public List<String> getAllCategories() {
        return doctorRepo.findAllSpecializations();
    }

    public List<Doctor> getNearbyDoctors(double lat, double lng) {
        return doctorRepo.findNearbyDoctors(lat, lng);
    }

    public List<Doctor> searchByHospitalName(String name) {
        return doctorRepo.findByHospitalNameContainingIgnoreCase(name);
    }

    public Doctor updateDoctorSchedule(Long doctorId, ScheduleUpdateRequest request) {
        Doctor doctor = doctorRepo.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found!"));

        // 1. Update the manual switch
        doctor.setAvailable(request.isAvailable());

        // 2. Clear old shifts and save the new ones
        if (request.getShifts() != null) {
            doctor.getShifts().clear();
            doctor.getShifts().addAll(request.getShifts());
        }

        return doctorRepo.save(doctor);
    }

}

