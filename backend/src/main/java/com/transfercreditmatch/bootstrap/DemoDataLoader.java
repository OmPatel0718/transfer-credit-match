package com.transfercreditmatch.bootstrap;

import com.transfercreditmatch.entities.User;
import com.transfercreditmatch.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Seeds minimal users when using {@code demo} profile (H2 in-memory) so local dev can log in without MySQL.
 */
@Component
@Profile("demo")
public class DemoDataLoader implements CommandLineRunner {

    private final UserRepository userRepository;

    public DemoDataLoader(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }
        seed("Eve Thompson", "eve.thompson@admin.com", "demo123", User.Role.admin);
        seed("Alice Johnson", "alice.johnson@roosevelt.edu", "demo123", User.Role.director);
        seed("Charlie Davis", "charlie.davis@roosevelt.edu", "demo123", User.Role.student);
        seed("Matthew Gebara", "mgebara@mail.roosevelt.edu", "demo123", User.Role.student);
    }

    private void seed(String name, String email, String password, User.Role role) {
        User u = new User();
        u.setName(name);
        u.setEmail(email);
        u.setPasswordHash(password);
        u.setRole(role);
        userRepository.save(u);
    }
}
