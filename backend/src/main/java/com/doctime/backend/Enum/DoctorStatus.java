package com.doctime.backend.Enum;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

public enum DoctorStatus {
    PENDING, APPROVED, REJECTED
}


