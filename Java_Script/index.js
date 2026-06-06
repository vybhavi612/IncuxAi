const minNum = 1;
const maxNum = 100;
const answer = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
let attempts = 0;
const guessInput = document.getElementById("guessInput");
const submitBtn = document.getElementById("submitBtn");
const feedbackMsg = document.getElementById("feedbackMsg");
submitBtn.onclick = function() {    
    let userGuess = Number(guessInput.value);    
    if (isNaN(userGuess)) {
        feedbackMsg.textContent = "❌ Please enter a valid number!";
        feedbackMsg.className = "too-high";
    } 
    else if (userGuess < minNum || userGuess > maxNum) {
        feedbackMsg.textContent = `⚠️ Please enter a number between ${minNum} and ${maxNum}!`;
        feedbackMsg.className = "too-high";
    } 
    else {
        attempts++;
        if (userGuess < answer) {
            feedbackMsg.textContent = "📉 Too Low! Try a higher number.";
            feedbackMsg.className = "too-low";
        } 
        else if (userGuess > answer) {
            feedbackMsg.textContent = "📈 Too High! Try a lower number.";
            feedbackMsg.className = "too-high";
        } 
        else {
            feedbackMsg.textContent = `🎉 Correct! The answer was ${answer}. It took you ${attempts} attempts!`;
            feedbackMsg.className = "correct";
            guessInput.disabled = true;
            submitBtn.disabled = true;
            submitBtn.style.backgroundColor = "#6c757d";
            submitBtn.textContent = "Game Over";
        }
    }
    guessInput.value = "";
    guessInput.focus();
};