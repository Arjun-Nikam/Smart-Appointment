package com.doctime.backend.Dto;

public class AuthResponse {

    private String token;
    private String role;
    private Object userProfile;

    public AuthResponse() {
    }

    public AuthResponse(String token, String role, Object userProfile) {
        this.token = token;
        this.role = role;
        this.userProfile = userProfile;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Object getUserProfile() {
        return userProfile;
    }

    public void setUserProfile(Object userProfile) {
        this.userProfile = userProfile;
    }
}
