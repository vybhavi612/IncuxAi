day-1
let name = "Prasanth";
console.log(name);
function greet() {
    console.log("Hello JavaScript");
}
greet();

day-2

let name = "Prashanth";
let age = 21;

console.log("Name:", name);
console.log("Age:", age);

let a = 10;
let b = 5;

console.log("Addition:", a + b);
console.log("Subtraction:", a - b);
console.log("Multiplication:", a * b);
console.log("Division:", a / b);

let num = 8;

if (num % 2 === 0) {
    console.log(num + " is Even");
} else {
    console.log(num + " is Odd");
}

for (let i = 1; i <= 5; i++) {
    console.log("Count:", i);
}

function greet(userName) {
    return "Hello, " + userName;
}

console.log(greet("Prashanth"));

day-3

let name = "Prashanth";
console.log(name.toUpperCase());
console.log(name.toLowerCase());
console.log(name.length);

let role = "Student";
console.log(`My name is ${name} and I am a ${role}`);
let skills = ["HTML", "CSS", "JavaScript"];

console.log(skills);
console.log(skills[0]);

skills.push("React");
console.log(skills);

skills.pop();
console.log(skills);
skills.forEach(skill => {
    console.log(skill);
});

DAY-3
function greet() {
    console.log("Hello JavaScript!");
}

greet();

function add(a, b) {
    console.log("Sum =", a + b);
}

add(10, 20);

function multiply(a, b) {
    return a * b;
}

let result = multiply(5, 4);
console.log(result);

day-4

let fruits = ["Apple", "Mango", "Banana"];
console.log(fruits[0]); 
fruits.push("Orange"); 
fruits.pop();           
for(let i = 0; i < fruits.length; i++) {
    console.log(fruits[i]);
}
let student = {
    name: "Prashanth",
    age: 21,
    course: "CSE"
};
console.log(student.name);
console.log(student.age);
student.city = "Hyderabad";
console.log(student);

for(let key in student){
    console.log(key + ": " + student[key]);
}
 day 5

function greet() {
    console.log("Hello JavaScript!");
}
greet();
function add(a, b) {
    console.log("Sum =", a + b);
}
add(10, 20);
function multiply(a, b) {
    return a * b;
}
let result = multiply(5, 4);
console.log("Multiplication =", result);
const square = (num) => {
    return num * num;
};
console.log("Square =", square(6));


day 6

let marks = 75;

if (marks >= 90) {
    console.log("Grade A");
} else if (marks >= 75) {
    console.log("Grade B");
} else if (marks >= 50) {
    console.log("Grade C");
} else {
    console.log("Fail");
}

let day = 3;

switch(day) {
    case 1:
        console.log("Monday");
        break;
    case 2:
        console.log("Tuesday");
        break;
    case 3:
        console.log("Wednesday");
        break;
    default:
        console.log("Invalid Day");
}
day-7

let students = [
    { name: "Prashanth", marks: 85 },
    { name: "Rahul", marks: 72 },
    { name: "Anjali", marks: 91 },
    { name: "Kiran", marks: 67 },
    { name: "Sneha", marks: 88 }
];

function calculateAverage(data) {
    let total = 0;

    for (let i = 0; i < data.length; i++) {
        total += data[i].marks;
    }

    return total / data.length;
}

function getTopper(data) {
    let topper = data[0];

    for (let i = 1; i < data.length; i++) {
        if (data[i].marks > topper.marks) {
            topper = data[i];
        }
    }

    return topper;
}

function displayResults(data) {
    for (let i = 0; i < data.length; i++) {
        let grade;

        if (data[i].marks >= 90) {
            grade = "A";
        } else if (data[i].marks >= 75) {
            grade = "B";
        } else if (data[i].marks >= 60) {
            grade = "C";
        } else {
            grade = "D";
        }

        console.log(
            "Name: " +
            data[i].name +
            ", Marks: " +
            data[i].marks +
            ", Grade: " +
            grade
        );
    }
}

displayResults(students);

let average = calculateAverage(students);
console.log("Average Marks:", average);

let topper = getTopper(students);
console.log("Topper:", topper.name, "-", topper.marks);
