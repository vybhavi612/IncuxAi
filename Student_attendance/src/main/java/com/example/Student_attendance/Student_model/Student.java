package com.example.Student_attendance.Student_model;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "students")
@AllArgsConstructor
@NoArgsConstructor
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;
    @Getter
    @Column(nullable = false,unique = true)
    private String email;
    private String phoneNumber;
    @Column(nullable = false)
    private String password;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

//    public static JsonSubTypes.Type builder() {
//    }

//    private String photoPath;
public enum Role {
    STUDENT,
    ADMIN
}
//
//    public Object getPassword() {
//        return password;
//    }
}
