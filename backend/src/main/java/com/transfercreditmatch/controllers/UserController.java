package com.transfercreditmatch.controllers;

import com.transfercreditmatch.dto.UserProfileResponse;
import com.transfercreditmatch.entities.User;
import com.transfercreditmatch.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // 1) GET /api/users - list all users
    @GetMapping
    public ResponseEntity<List<UserProfileResponse>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users.stream().map(this::toProfile).collect(Collectors.toList()));
    }

    // 2) GET /api/users/{id} - get one user by ID
    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponse> getUserById(@PathVariable Integer id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(toProfile(user));
    }

    // GET /api/users/me - current authenticated user
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser(Principal principal) {
        User user = userService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(toProfile(user));
    }

    // 3) POST /api/users - create a user (optional if you prefer /api/auth/register)
    @PostMapping
    public ResponseEntity<UserProfileResponse> createUser(@RequestBody User newUser) {
        User created = userService.createUser(newUser);
        return ResponseEntity.ok(toProfile(created));
    }

    // 4) PUT /api/users/{id} - update user
    @PutMapping("/{id}")
    public ResponseEntity<UserProfileResponse> updateUser(@PathVariable Integer id, @RequestBody User updatedData) {
        User updated = userService.updateUser(id, updatedData);
        return ResponseEntity.ok(toProfile(updated));
    }

    // 5) DELETE /api/users/{id} - already implemented
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User with ID " + id + " has been deleted.");
    }

    private UserProfileResponse toProfile(User user) {
        UserProfileResponse response = new UserProfileResponse();
        response.setUserId(user.getUserId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());
        return response;
    }
}

