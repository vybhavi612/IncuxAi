let randomNum = Math.floor(Math.random() * 6) + 1;
console.log("Random Number:", randomNum);
function rollDice() {
    let randomNum = Math.floor(Math.random() * 6) + 1;
    document.getElementById("diceResult").textContent =
        "You rolled: " + randomNum;
}