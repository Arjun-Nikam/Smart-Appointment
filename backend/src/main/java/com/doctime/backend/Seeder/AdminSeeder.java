package com.doctime.backend.Seeder;

import com.doctime.backend.Entity.Admin;
import com.doctime.backend.Repo.AdminRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements CommandLineRunner {

    @Autowired
    private AdminRepo adminRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        // Only creates admin if one doesn't already exist
        // Safe to run on every startup
        if (adminRepo.count() == 0) {
            Admin admin = new Admin();
            admin.setName("Super Admin");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            adminRepo.save(admin);
            System.out.println("✅ Default admin created: " + adminEmail);
        } else {
            System.out.println("✅ Admin already exists, skipping seeder.");
        }
    }
}