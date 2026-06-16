
// Find the Missing Number

let arr = [1, 2, 3, 5, 6];

let expectedSum = 0;
let actualSum = 0;

for(let i = 1; i <= 6; i++) {
    expectedSum += i;
}

for(let i = 0; i < arr.length; i++) {
    actualSum += arr[i];
}

console.log(
    "Missing Number:",
    expectedSum - actualSum
);