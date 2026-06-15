// Day7.js

// forEach()

const fruits = ["Apple", "Banana", "Mango"];

fruits.forEach((fruit, index) => {
    console.log(`${index + 1}. ${fruit}`);
});

// find()

const employees = [
    { id: 1, name: "Rahul" },
    { id: 2, name: "Abhinay" },
    { id: 3, name: "Priya" }
];

const employee = employees.find(emp => emp.id === 2);

console.log(employee);

// some()

const numbers = [10, 20, 30, 40];

const hasGreaterThan25 = numbers.some(num => num > 25);

console.log(hasGreaterThan25);

// every()

const allPositive = numbers.every(num => num > 0);

console.log(allPositive);
