package com.transfercreditmatch.services;

import com.transfercreditmatch.dto.RegisterRequest;
import com.transfercreditmatch.entities.User;
import com.transfercreditmatch.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Register a new user with the given details.
     * Converts the 'role' to lowercase to avoid "No enum constant" issues.
     */
    public User register(String name, String email, String rawPassword, String role) {
        // 1. Check if email already exists
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            throw new RuntimeException("Email is already registered.");
        }

        // 2. Create a new user entity
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(rawPassword);

        // Convert role to lowercase before valueOf
        String sanitizedRole = role.toLowerCase().trim();
        user.setRole(User.Role.valueOf(sanitizedRole));

        // 3. Save to DB
        return userRepository.save(user);
    }

    /**
     * Log in an existing user by email and password.
     */
    public User login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Compare password (in real apps, you'd hash & compare)
        if (!user.getPasswordHash().equals(rawPassword)) {
            throw new RuntimeException("Invalid credentials");
        }

        return user;
    }
}
