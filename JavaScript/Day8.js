// Day8.js

// Spread Operator

const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];

const combined = [...arr1, ...arr2];

console.log(combined);

// Rest Operator

function sum(...numbers) {
    return numbers.reduce((total, num) => total + num, 0);
}

console.log(sum(10, 20, 30, 40));

// Object Destructuring

const student = {
    name: "Abhinay",
    age: 20,
    branch: "CSE"
};

const { name, age, branch } = student;

console.log(name);
console.log(age);
console.log(branch);

// Template Literals

console.log(`${name} is ${age} years old and studies ${branch}`);
