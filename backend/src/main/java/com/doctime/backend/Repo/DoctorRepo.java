package com.doctime.backend.Repo;

import com.doctime.backend.Entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepo extends JpaRepository<Doctor, Long> {

    // For Doctor Login
    Optional<Doctor> findByEmail(String email);

    // For Patient Search: Find doctors by exactly matching the specialty
    List<Doctor> findBySpecializationIgnoreCase(String specialization);

    // For Patient Search: If they type "sha", it finds "Dr. Sharma"
    List<Doctor> findByNameContainingIgnoreCase(String name);

    @Query("SELECT DISTINCT d.specialization FROM Doctor d")
    List<String> findAllSpecializations();

    // 2. Get Nearest Doctors: Math formula to sort doctors by distance (in Kilometers)
    @Query(value = "SELECT * FROM doctors " +
            "ORDER BY (6371 * acos(cos(radians(:userLat)) * cos(radians(latitude)) * " +
            "cos(radians(longitude) - radians(:userLng)) + " +
            "sin(radians(:userLat)) * sin(radians(latitude)))) ASC",
            nativeQuery = true)
    List<Doctor> findNearbyDoctors(@Param("userLat") double userLat, @Param("userLng") double userLng);

    // Search doctors by hospital name (Case-insensitive, partial match)
    List<Doctor> findByHospitalNameContainingIgnoreCase(String hospitalName);


}
