let words = [
    "apple",
    "banana",
    "watermelon",
    "kiwi",
    "grapes"
];

let longest = words[0];

for(let i = 1; i < words.length; i++) {

    if(words[i].length > longest.length) {
        longest = words[i];
    }
}

console.log(longest);