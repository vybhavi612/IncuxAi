
// 1.Kelvin Weather========================================================

const kelvin = 293;
// This var is constant 
const celsius = kelvin-273;
//This is celcius variable
let fahrenheit = celsius*(9/5)+32;
fahrenheit = Math.round(fahrenheit);
//changed the value and stored it again 
fahrenheit = Math.floor(fahrenheit);
//Since we always get decimal number form convertion so we used floor
console.log(`The temperature is ${fahrenheit} degrees Fahrenheit`);


// 2.Dog Years============================================================

let myAge =19 ;
// I am setting my age
let earlyYears=2;
// some years we are considering for now 
earlyYears *=10.5;
myAge -=2;
//Since we already accounted for the first two years, take the myAge variable
let lateYears =myAge;
lateYears *=4;
let myAgeInDogYears=earlyYears+earlyYears;
let myName= console.log('Shafi'.toLowerCase());
console.log(`My name is ${myName}. I am ${myAge} years old in human years, which is ${myAgeInDogYears} years old in dog years.`);
//SO here we printed the info 
