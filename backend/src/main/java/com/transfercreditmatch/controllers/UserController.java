package com.transfercreditmatch.controllers;

import com.transfercreditmatch.entities.User;
import com.transfercreditmatch.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // 1) GET /api/users - list all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // 2) GET /api/users/{id} - get one user by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    // 3) POST /api/users - create a user (optional if you prefer /api/auth/register)
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User newUser) {
        User created = userService.createUser(newUser);
        return ResponseEntity.ok(created);
    }

    // 4) PUT /api/users/{id} - update user
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Integer id, @RequestBody User updatedData) {
        User updated = userService.updateUser(id, updatedData);
        return ResponseEntity.ok(updated);
    }

    // 5) DELETE /api/users/{id} - already implemented
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User with ID " + id + " has been deleted.");
    }
}

