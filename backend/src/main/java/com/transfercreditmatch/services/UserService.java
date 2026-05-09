package com.transfercreditmatch.services;

import com.transfercreditmatch.entities.User;
import com.transfercreditmatch.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // List all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Get one user by ID
    public User getUserById(Integer id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
    }

    // Create a user (only if needed; otherwise rely on Auth register)
    public User createUser(User newUser) {
        // Possibly set a default role, or hash the password, etc.
        return userRepository.save(newUser);
    }

    // Update user
    public User updateUser(Integer id, User updatedData) {
        User existing = getUserById(id);
        // Overwrite the fields you want to allow updating:
        existing.setName(updatedData.getName());
        existing.setEmail(updatedData.getEmail());
        existing.setPasswordHash(updatedData.getPasswordHash());
        existing.setRole(updatedData.getRole());
        return userRepository.save(existing);
    }

    // Delete user
    public void deleteUser(Integer id) {
        userRepository.deleteById(id);
    }
}

