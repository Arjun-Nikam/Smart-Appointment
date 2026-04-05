package com.doctime.backend.Service;

import com.doctime.backend.Dto.ScheduleUpdateRequest;
import com.doctime.backend.Entity.Doctor;
import com.doctime.backend.Enum.DoctorStatus;
import com.doctime.backend.Repo.DoctorRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepo doctorRepo;

    public List<Doctor> getAllDoctors() {
        return doctorRepo.findByStatus(DoctorStatus.APPROVED);
    }

    public List<Doctor> getDoctorsBySpecialty(String specialty) {
        return doctorRepo.findBySpecializationIgnoreCase(specialty, DoctorStatus.APPROVED);
    }

    public List<Doctor> searchDoctorByName(String name) {
        return doctorRepo.findByNameContainingIgnoreCase(name, DoctorStatus.APPROVED);
    }

    public List<String> getAllCategories() {
        return doctorRepo.findAllSpecializations();
    }

    public List<Doctor> getNearbyDoctors(double lat, double lng) {
        return doctorRepo.findNearbyDoctors(lat, lng);
    }

    public List<Doctor> searchByHospitalName(String name) {
        return doctorRepo.findByHospitalNameContainingIgnoreCase(name, DoctorStatus.APPROVED);
    }

    // FIX #5: Takes email from token — not doctorId from URL
    // Doctor can only ever update their own schedule
    public Doctor updateDoctorSchedule(String doctorEmail, ScheduleUpdateRequest request) {
        Doctor doctor = doctorRepo.findByEmail(doctorEmail)
                .orElseThrow(() -> new RuntimeException("Invalid credentials."));

        doctor.setAvailable(request.isAvailable());

        if (request.getShifts() != null) {
            doctor.getShifts().clear();
            doctor.getShifts().addAll(request.getShifts());
        }

        return doctorRepo.save(doctor);
    }
}
