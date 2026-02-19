package com.doctime.backend.Dto;

import com.doctime.backend.Entity.Shift;
import lombok.Data;
import java.util.List;

@Data
public class ScheduleUpdateRequest {
    private boolean available;
    private List<Shift> shifts;

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public List<Shift> getShifts() {
        return shifts;
    }

    public void setShifts(List<Shift> shifts) {
        this.shifts = shifts;
    }
}