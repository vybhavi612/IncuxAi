// const numbers = [1, 2, 3, 4, 5];

// const squares = numbers.map(num => num * num);

// console.log(squares);
const numbers = [1, 2, 3, 4, 5, 6];

const evens = numbers.filter(num => num % 2 === 0);

console.log(evens);
const names = ["Sridhar", "Ravi", "Kiran"];

names.forEach(name => {
    console.log("Hello " + name);
});