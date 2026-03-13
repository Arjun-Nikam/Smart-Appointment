package com.doctime.backend.Seeder;

import com.doctime.backend.Repo.AppointmentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AppointmentCleanupJob {

    @Autowired
    private AppointmentRepo appointmentRepo;

    // Runs every day at 11:59 PM
    // Marks all BOOKED/CHECKED_IN appointments as NO_SHOW
    // if they were never completed
    @Scheduled(cron = "0 59 23 * * *")
    @Transactional
    public void markExpiredAppointmentsAsNoShow() {
        int count = appointmentRepo.markExpiredAppointmentsNoShow();
        System.out.println("[Cleanup] Marked " + count +
                " expired appointments as NO_SHOW");
    }
}