// Day3.js

// 1. Callback Function
function greet(name, callback) {
    console.log("Hello, " + name);
    callback();
}

function sayBye() {
    console.log("Goodbye!");
}

greet("Abhinay", sayBye);

// 2. setTimeout
setTimeout(() => {
    console.log("This message appears after 2 seconds");
}, 2000);

// 3. Array Map
const numbers = [1, 2, 3, 4, 5];

const squares = numbers.map(num => num * num);

console.log("Squares:", squares);

// 4. Array Filter
const evenNumbers = numbers.filter(num => num % 2 === 0);

console.log("Even Numbers:", evenNumbers);

// 5. Array Reduce
const sum = numbers.reduce((total, num) => total + num, 0);

console.log("Sum:", sum);

// 6. Template Literals
const student = "Abhinay";
const course = "JavaScript";

console.log(`${student} is learning ${course}`);

// 7. Default Parameters
function multiply(a, b = 2) {
    return a * b;
}

console.log("Multiply:", multiply(10));

// 8. Rest Operator
function addNumbers(...nums) {
    return nums.reduce((a, b) => a + b, 0);
}

console.log("Total:", addNumbers(10, 20, 30, 40));
