// Day5.js

// map() - Increase marks by 5

const marks = [65, 70, 80, 90];

const updatedMarks = marks.map(mark => mark + 5);

console.log("Updated Marks:", updatedMarks);

// filter() - Students who passed

const scores = [35, 45, 20, 80, 60];

const passedStudents = scores.filter(score => score >= 35);

console.log("Passed Students:", passedStudents);

// reduce() - Total Marks

const totalMarks = scores.reduce((sum, score) => sum + score, 0);

console.log("Total Marks:", totalMarks);

// map() with objects

const students = [
    { name: "Abhinay", age: 20 },
    { name: "Rahul", age: 21 },
    { name: "Priya", age: 19 }
];

const names = students.map(student => student.name);

console.log(names);
