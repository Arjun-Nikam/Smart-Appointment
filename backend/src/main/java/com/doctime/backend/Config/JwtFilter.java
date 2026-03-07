package com.doctime.backend.Config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // No token present — let SecurityConfig decide if route is public or not
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        String email = null;
        String role = null;

        try {
            email = jwtUtil.extractEmail(token);
            role  = jwtUtil.extractRole(token);
        } catch (Exception e) {
            // FIX #4: Return proper 401 JSON response — no more silent console print
            sendErrorResponse(response, "Invalid or malformed token.");
            return;
        }

        // FIX #5: Explicitly reject expired tokens with a clear response
        if (!jwtUtil.isTokenValid(token)) {
            sendErrorResponse(response, "Token has expired. Please log in again.");
            return;
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            SimpleGrantedAuthority authority =
                    new SimpleGrantedAuthority("ROLE_" + role);

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                            email, null, Collections.singletonList(authority));

            authToken.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        filterChain.doFilter(request, response);
    }

    // FIX #4 & #5: Clean JSON 401 instead of silent failure or HTML error page
    private void sendErrorResponse(HttpServletResponse response, String message)
            throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, String> error = Map.of(
                "error", "Unauthorized",
                "message", message
        );

        new ObjectMapper().writeValue(response.getOutputStream(), error);
    }
}