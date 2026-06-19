let numbers = [10, 20, 30, 20, 40, 10, 50, 30];

let unique = [];

for (let i = 0; i < numbers.length; i++) {

    if (!unique.includes(numbers[i])) {
        unique.push(numbers[i]);
    }

}

console.log("Original Array:", numbers);
console.log("Without Duplicates:", unique);