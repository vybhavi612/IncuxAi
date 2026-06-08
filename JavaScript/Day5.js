// Find the largest element in array, with index and reverse the array 


// Function to find the maximum value in an array
function findMaximum(arr) {
    let max = arr[0]; 
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
    }
    return max;
}

// Function to search for an element (Linear Search)
function linearSearch(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) {
            return i; // Return index if found
        }
    }
    return -1; // Return -1 if not found
}

// Function to reverse an array manually
function reverseArray(arr) {
    let reversed = [];
    for (let i = arr.length - 1; i >= 0; i--) {
        reversed.push(arr[i]);
    }
    return reversed;
}


const numbers = [23, 89, 5, 42, 12, 77];
const searchTarget = 42;


console.log(`Original Array : [ ${numbers.join(", ")} ]`);
// Task1: Find Maximum
const maxNumber = findMaximum(numbers);
console.log(`1. Maximum Element       : ${maxNumber}`);
// Task 2: Linear Search
const searchResult = linearSearch(numbers, searchTarget);
if (searchResult !== -1) {
    console.log(`2. Search Element (${searchTarget}) : Found at Index ${searchResult}`);
} else {
    console.log(`2. Search Element (${searchTarget}) : Not Found`);
}
// Task 3: Reverse Array
const reversedNumbers = reverseArray(numbers);
console.log(`3. Reversed Array        : [ ${reversedNumbers.join(", ")} ]`);
