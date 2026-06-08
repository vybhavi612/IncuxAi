//Aim: To implement foundational JavaScript concepts including variables, data types,
//conditional statements, loops, and functions to solve a practical computational problem.

//  Function to determine letter grade based on numerical score
function calculateGrade(score) {
    if (score >= 90) {
        return 'A';
    } else if (score >= 80) {
        return 'B';
    } else if (score >= 70) {
        return 'C';
    } else if (score >= 50) {
        return 'D';
    } else {
        return 'F';
    }
}
//  execution block
const studentScores = [95, 42, 78, 88, 61, 49, 91];
let passCount = 0;
console.log(" Student Grading Report");
for (let i = 0; i < studentScores.length; i++) {
    let currentScore = studentScores[i];
    let finalGrade = calculateGrade(currentScore);
    if (finalGrade !== 'F') {
        passCount++;
    }
    console.log(`Student ${i + 1}: Score = ${currentScore}, Grade = ${finalGrade}`);
}
console.log(`Total Students Tested: ${studentScores.length}`);
console.log(`Total Students Passed: ${passCount}`);
console.log(`Total Students Failed: ${studentScores.length - passCount}`);
