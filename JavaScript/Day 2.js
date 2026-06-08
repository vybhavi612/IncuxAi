// 1. Basic Function Declaration
function addNumbers(a, b) {
    return a + b;
}


const multiplyNumbers = (a, b) => a * b;

//  Function with a Callback
function processInput(callback) {
    const input = "Data received";
    callback(input);
}


console.log(addNumbers(5, 10));          // Output: 15
console.log(multiplyNumbers(4, 5));     // Output: 20

processInput((data) => {
    console.log(`Callback output: ${data}`); 
});
