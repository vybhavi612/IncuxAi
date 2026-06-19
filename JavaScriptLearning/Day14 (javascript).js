let numbers = [5, 3, 5, 2, 3, 5, 8, 2];

let frequency = {};

for (let i = 0; i < numbers.length; i++) {

    if (frequency[numbers[i]]) {
        frequency[numbers[i]]++;
    } else {
        frequency[numbers[i]] = 1;
    }

}

console.log("Array:", numbers);
console.log("Frequency of Elements:");

for (let key in frequency) {
    console.log(key + " -> " + frequency[key]);
}