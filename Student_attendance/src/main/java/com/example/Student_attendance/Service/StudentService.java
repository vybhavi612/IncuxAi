package com.example.Student_attendance.Service;

import com.example.Student_attendance.Student_model.Student;
import com.example.Student_attendance.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {
    @Autowired
    private StudentRepository studentRepository;
    public ResponseEntity<?> login(Student student) {
    studentRepository.save(student);
    return ResponseEntity.ok("Student registered successful");
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }
}
