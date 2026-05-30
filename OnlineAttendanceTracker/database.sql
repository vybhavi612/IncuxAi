CREATE DATABASE attendance_system;

USE attendance_system;

CREATE TABLE students(
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    photo VARCHAR(255),
    login_time DATETIME,
    logout_time DATETIME,
    active_duration INT DEFAULT 0,
    idle_duration INT DEFAULT 0,
    attendance_status VARCHAR(50) DEFAULT 'Offline'
);

CREATE TABLE admins(
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255)
);

INSERT INTO admins(email,password)
VALUES('admin@gmail.com','admin123');