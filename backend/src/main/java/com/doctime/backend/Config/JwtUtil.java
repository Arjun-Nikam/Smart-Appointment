package com.doctime.backend.Config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    // This is your secret signature. NEVER share this in a real production app!
    // It must be at least 256-bit (Base64 encoded). Here is a secure generated one for your project:
    public static final String SECRET = "5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437";

    // 1. Generate the token
    public String generateToken(String email, String role, Long id) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("id", id); // Storing the user's DB ID right inside the token!
        return createToken(claims, email);
    }

    // 2. Build the exact JWT structure (Header + Payload + Signature)
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject) // Usually the email
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // Token valid for 10 hours
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // 3. Cryptographic signing key
    private Key getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }


    // 4. Extract EVERYTHING from the token
    private io.jsonwebtoken.Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // 5. Extract just the Email (Subject)
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    // 6. Extract the Role (Patient or Doctor)
    public String extractRole(String token) {
        return (String) extractAllClaims(token).get("role");
    }

    // 7. Check if the token is expired
    public boolean isTokenValid(String token) {
        try {
            return !extractAllClaims(token).getExpiration().before(new Date());
        } catch (Exception e) {
            return false; // If math fails or token is tampered with, it's invalid!
        }
    }
}