package com.example.Student_attendance.Student_model;

import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name="progress")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DailyProgress {
@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
@Column(nullable=false)
private LocalDate date;
@Column(nullable = false)
private  boolean workToday;
@Column(nullable = false)
private boolean pushedToGithub;
@Column(length = 1000)
private String taskDescription;
@ManyToOne(fetch = FetchType.EAGER)
@JoinColumn(name = "student_id",nullable = false)
private Student student;

}
