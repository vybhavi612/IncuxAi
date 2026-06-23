let marks = [45, 82, 67, 39, 91, 58, 74];

let passedStudents = marks
    .filter(mark => mark >= 60)
    .map(mark => mark + 5);

console.log("Original Marks:", marks);
console.log("Passed Students with Bonus Marks:", passedStudents);