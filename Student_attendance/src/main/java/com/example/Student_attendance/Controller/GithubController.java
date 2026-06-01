package com.example.Student_attendance.Controller;

import com.example.Student_attendance.Service.GithubService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/github")
@CrossOrigin("*")
public class GithubController {

    @Autowired
    private GithubService githubService;

    @GetMapping("/check/{username}")
    public ResponseEntity<?> checkGithubActivity(
            @PathVariable String username) {

        int active =
                githubService.getPushCountLast24hours(username);

        return ResponseEntity.ok(
                Map.of("active", active>0,
                        "pushcount",active)
        );
    }
}