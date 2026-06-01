package com.example.Student_attendance.Controller;

import com.example.Student_attendance.Service.StudentService;
import com.example.Student_attendance.Student_model.Student;
import com.example.Student_attendance.repository.StudentRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/student")
public class StudentController {
    @Autowired
    private StudentService service;
    @PostMapping("/register")

    public ResponseEntity<?> login(
            @RequestBody Student student
    ) {

        return service.login(student);
    }
    @GetMapping("/students")
    public List<Student> getAllStudents(){
        return service.getAllStudents();
    }

}
