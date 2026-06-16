
// Move all zeros to end

let arr = [0, 5, 0, 3, 8, 0, 1];
let result = [];

for(let i = 0; i < arr.length; i++) {
    if(arr[i] !== 0) {
        result.push(arr[i]);
    }
}

for(let i = 0; i < arr.length; i++) {
    if(arr[i] === 0) {
        result.push(0);
    }
}

console.log(result);