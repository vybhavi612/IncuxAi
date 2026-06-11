//simple js

console.log("Hello, World!");
alert("Hello, World!");



//sum of two numbers
let num1 = 15;
let num2 = 25;
let sum = num1 + num2;
console.log("The sum of " + num1 + " and " + num2 + " is: " + sum);



//conditional statement
function checkOddOrEven(number) {
    if (number % 2 === 0) {
        console.log(number + " is Even.");
    } else {
        console.log(number + " is Odd.");
    }
}
checkOddOrEven(7);  
checkOddOrEven(12);

//multiplication table
let number = 5;
for (let i = 1; i <= 10; i++) {
    console.log(`${number} x ${i} = ${number * i}`);
}