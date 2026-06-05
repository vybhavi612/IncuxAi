// Day1.js

// 1. Variables
let name = "Abhinay";
const age = 20;

console.log("Name:", name);
console.log("Age:", age);

// 2. Arithmetic Operations
let a = 10;
let b = 5;

console.log("Addition:", a + b);
console.log("Subtraction:", a - b);
console.log("Multiplication:", a * b);
console.log("Division:", a / b);

// 3. Conditional Statements
let marks = 85;

if (marks >= 90) {
    console.log("Grade A");
} else if (marks >= 75) {
    console.log("Grade B");
} else {
    console.log("Grade C");
}

// 4. Loops
console.log("Numbers from 1 to 5:");

for (let i = 1; i <= 5; i++) {
    console.log(i);
}

// 5. Functions
function square(num) {
    return num * num;
}

console.log("Square of 6:", square(6));

// 6. Arrays
let fruits = ["Apple", "Banana", "Mango"];

for (let fruit of fruits) {
    console.log(fruit);
}
