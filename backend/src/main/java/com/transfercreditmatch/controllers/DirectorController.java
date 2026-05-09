package com.transfercreditmatch.controllers;

import com.transfercreditmatch.entities.Director;
import com.transfercreditmatch.services.DirectorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/directors")
public class DirectorController {

    private final DirectorService directorService;

    public DirectorController(DirectorService directorService) {
        this.directorService = directorService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Director> getDirector(@PathVariable Integer id) {
        Director director = directorService.getDirectorById(id);
        return ResponseEntity.ok(director);
    }

    @PutMapping("/{id}/update")
    public ResponseEntity<Director> updateDirector(@PathVariable Integer id, @RequestBody Director updatedData) {
        Director updated = directorService.updateDirector(id, updatedData);
        return ResponseEntity.ok(updated);
    }


}
