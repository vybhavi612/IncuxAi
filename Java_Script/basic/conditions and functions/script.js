// Declaring the function
function greetUser() {
    console.log("Hello! Welcome back.");
}
greetUser(); 


//The if...else Statement
let age = 16;

if (age >= 18) {
    console.log("You can vote.");
} else {
    console.log("You are too young to vote.");
}



//The else if Statement

let score = 85;

if (score >= 90) {
    console.log("Grade: A");
} else if (score >= 80) {
    console.log("Grade: B");
} else {
    console.log("Grade: C");
}



//Combining Functions and Conditions
function checkTicketPrice(age) {
  
    if (age < 5) {
        return "Ticket is free.";
    } 
   
    else if (age >= 65) {
        return "Senior discount price: $10.";
    } 

    else {
        return "Regular ticket price: $15.";
    }
}
console.log(checkTicketPrice(3));   
console.log(checkTicketPrice(25));  
console.log(checkTicketPrice(70)); 

