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
