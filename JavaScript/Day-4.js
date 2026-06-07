// Day4.js

// 1. Destructuring Objects
const student = {
    name: "Abhinay",
    age: 20,
    course: "JavaScript"
};

const { name, age, course } = student;

console.log(name);
console.log(age);
console.log(course);

// 2. Spread Operator
const numbers1 = [1, 2, 3];
const numbers2 = [4, 5, 6];

const combined = [...numbers1, ...numbers2];

console.log("Combined Array:", combined);

// 3. Promise Example
const promise = new Promise((resolve, reject) => {
    let success = true;

    if (success) {
        resolve("Task Completed Successfully");
    } else {
        reject("Task Failed");
    }
});

promise
    .then(result => console.log(result))
    .catch(error => console.log(error));

// 4. Async/Await
function fetchData() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve("Data Received");
        }, 2000);
    });
}

async function getData() {
    const result = await fetchData();
    console.log(result);
}

getData();

// 5. Arrow Function
const square = num => num * num;

console.log("Square:", square(8));

// 6. Array find()
const employees = [
    { id: 1, name: "Rahul" },
    { id: 2, name: "Abhinay" },
    { id: 3, name: "Priya" }
];

const employee = employees.find(emp => emp.id === 2);

console.log(employee);

// 7. Array includes()
const fruits = ["Apple", "Banana", "Mango"];

console.log(fruits.includes("Banana"));
console.log(fruits.includes("Orange"));
