const quiz = [
{
    question: "JavaScript was created in?",
    answers: ["1995", "2000", "1990"],
    correct: "1995"
},
{
    question: "Which keyword creates variable?",
    answers: ["let", "loop", "array"],
    correct: "let"
}
];

let current = 0;
let score = 0;

function loadQuestion() {

    const q = quiz[current];

    document.getElementById("question")
    .textContent = q.question;

    const answersDiv =
    document.getElementById("answers");

    answersDiv.innerHTML = "";

    q.answers.forEach(answer => {

        const btn =
        document.createElement("button");

        btn.textContent = answer;

        btn.onclick = () => {

            if (answer === q.correct) {
                score++;
            }
        };

        answersDiv.appendChild(btn);
    });
}

function nextQuestion() {

    current++;

    if (current < quiz.length) {

        loadQuestion();

    } else {

        document.getElementById("score")
        .textContent =
        `Final Score: ${score}/${quiz.length}`;
    }
}

loadQuestion();

