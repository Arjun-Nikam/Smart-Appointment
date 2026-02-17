package com.doctime.backend.Config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Look for the "Authorization" header
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String email = null;
        String role = null;

        // 2. Check if the header exists and starts with "Bearer "
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); // Remove "Bearer " to get the pure token
            try {
                email = jwtUtil.extractEmail(token);
                role = jwtUtil.extractRole(token);
            } catch (Exception e) {
                System.out.println("Invalid Token!");
            }
        }

        // 3. If we found an email and they aren't already authenticated on this request...
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // 4. Validate the token hasn't expired
            if (jwtUtil.isTokenValid(token)) {

                // 5. Create the "Security Badge" (Authentication Token)
                // We add "ROLE_" prefix because Spring Security likes it that way
                SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        email, null, Collections.singletonList(authority));

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 6. Clip the badge to Spring's internal clipboard
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 7. Let the request continue to the Controller!
        filterChain.doFilter(request, response);
    }
}