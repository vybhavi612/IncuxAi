// check even or odd

function checkEvenOdd(number) {
    if (number % 2 === 0) {
        return "Even";
    } else {
        return "Odd";
    }
}

const testNumber1 = 7;
const testNumber2 = 14;
console.log("EVEN OR ODD CHECKER ");
let result1 = checkEvenOdd(testNumber1);
console.log(`The number ${testNumber1} is: ${result1}`);
let result2 = checkEvenOdd(testNumber2);
console.log(`The number ${testNumber2} is: ${result2}`);


// Arrays- Basic 

const colors = ["Red", "Green", "Blue"];
console.log("ARRAY OPERATIONS");
console.log(`Original Array: [ ${colors.join(", ")} ]`);
console.log(`Total elements initially: ${colors.length}`);
//  Adding a new element to the end of the array using push()
colors.push("Yellow");
console.log("After pushing 'Yellow':");
console.log(`Updated Array: [ ${colors.join(", ")} ]`);
console.log(`Total elements now: ${colors.length}`);
//  Displaying array elements using a basic 'for' loop
console.log("Array Traversal (Index and Value):");
for (let i = 0; i < colors.length; i++) {
    console.log(`Index ${i} -> Element: ${colors[i]}`);
}
