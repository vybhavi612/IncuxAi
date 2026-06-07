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
