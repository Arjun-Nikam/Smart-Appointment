package com.doctime.backend.Config;

import com.doctime.backend.Entity.BlacklistedToken;
import com.doctime.backend.Repo.BlacklistedTokenRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class TokenBlacklist {

    @Autowired
    private BlacklistedTokenRepo blacklistedTokenRepo;

    // Reads the same expiration value used in JwtUtil — keeps them in sync
    @Value("${jwt.expiration}")
    private long expirationMs;

    // Called on logout — saves token to DB with its expiry time
    public void blacklist(String token) {
        LocalDateTime expiresAt = LocalDateTime.now()
                .plusSeconds(expirationMs / 1000);

        blacklistedTokenRepo.save(new BlacklistedToken(token, expiresAt));
    }

    // Called on every request in JwtFilter
    public boolean isBlacklisted(String token) {
        return blacklistedTokenRepo.existsById(token);
    }

    // Runs every night at midnight — cleans up expired tokens from the DB
    // No need to keep tokens that have already naturally expired
    @Scheduled(cron = "0 0 0 * * *")
    public void purgeExpiredTokens() {
        blacklistedTokenRepo.deleteAllExpiredBefore(LocalDateTime.now());
    }
}