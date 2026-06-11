const kelvin = 293; 
const celsius = kelvin - 273.15; 
let fahrenheit = celsius * (9 / 5) + 32;

fahrenheit = Math.floor(fahrenheit); 
console.log(`The temperature is ${fahrenheit} degrees Fahrenheit.`); 

