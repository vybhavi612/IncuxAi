function reverseString(str) {
    return str.split('').reverse().join('');
}

console.log(reverseString("hello")); 


//for loop
function reverseWithLoop(str) {
    let reversedStr = "";
    for (let i = str.length - 1; i >= 0; i--) {
        reversedStr += str[i];
    }
    return reversedStr;
}

console.log(reverseWithLoop("world")); 

