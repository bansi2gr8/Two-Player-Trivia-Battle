document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('select-category').addEventListener('click', selectCategory);
document.getElementById('next-question').addEventListener('click', nextQuestion);
document.getElementById('restart-game').addEventListener('click', restartGame);

let player1, player2, currentPlayer;
let scores = { player1: 0, player2: 0 };
let currentQuestionIndex = 0;
let currentCategory;
let questions;
let usedCategories = [];

function startGame() {
    player1 = document.getElementById('player1-name').value;
    player2 = document.getElementById('player2-name').value;

    if (!player1 || !player2) {
        alert("Please enter names for both players.");
        return;
    }

    currentPlayer = player1;

    document.getElementById('player-setup').classList.add('hidden');
    document.getElementById('category-selection').classList.remove('hidden');

    fetchCategories();
}

function fetchCategories() {
    fetch('https://the-trivia-api.com/api/categories')
        .then(response => response.json())
        .then(data => {
            let categorySelect = document.getElementById('category-select');
            categorySelect.innerHTML = '';

            data.forEach(category => {
                if (!usedCategories.includes(category)) {
                    let option = document.createElement('option');
                    option.value = category;
                    option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
                    categorySelect.appendChild(option);
                }
            });
        });
}

function selectCategory() {
    currentCategory = document.getElementById('category-select').value;
    usedCategories.push(currentCategory);

    fetchQuestions(currentCategory)
        .then(data => {
            questions = data;
            currentQuestionIndex = 0;

            document.getElementById('category-selection').classList.add('hidden');
            document.getElementById('question-section').classList.remove('hidden');
            document.getElementById('scoreboard').classList.remove('hidden');

            showQuestion();
        });
}

function fetchQuestions(category) {
    return fetch(`https://the-trivia-api.com/api/questions?categories=${category}&limit=6`)
        .then(response => response.json());
}

function showQuestion() {
    let question = questions[currentQuestionIndex];

    document.getElementById('question-text').textContent = question.question;
    let answersDiv = document.getElementById('answers');
    answersDiv.innerHTML = '';

    let allAnswers = [...question.incorrectAnswers, question.correctAnswer];
    allAnswers.sort(() => Math.random() - 0.5);

    allAnswers.forEach(answer => {
        let button = document.createElement('button');
        button.textContent = answer;
        button.addEventListener('click', () => checkAnswer(answer, button));
        answersDiv.appendChild(button);
    });
}

function checkAnswer(selectedAnswer, answerButton) {
    let correctAnswer = questions[currentQuestionIndex].correctAnswer;

    if (selectedAnswer === correctAnswer) {
        answerButton.classList.add('correct');
        if (currentQuestionIndex < 2) {
            scores[currentPlayer === player1 ? 'player1' : 'player2'] += 10;
        } else if (currentQuestionIndex < 4) {
            scores[currentPlayer === player1 ? 'player1' : 'player2'] += 15;
        } else {
            scores[currentPlayer === player1 ? 'player1' : 'player2'] += 20;
        }
    } else {
        answerButton.classList.add('incorrect');
    }

    document.getElementById('player1-score').textContent = `${player1}: ${scores.player1}`;
    document.getElementById('player2-score').textContent = `${player2}: ${scores.player2}`;

    let buttons = document.querySelectorAll('#answers button');
    buttons.forEach(button => button.disabled = true);

    currentPlayer = currentPlayer === player1 ? player2 : player1;
    document.getElementById('next-question').classList.remove('hidden');
}

function nextQuestion() {
    currentQuestionIndex++;

    if (currentQuestionIndex < 6) {
        showQuestion();
        document.getElementById('next-question').classList.add('hidden');
    } else {
        if (usedCategories.length < document.getElementById('category-select').options.length) {
            document.getElementById('question-section').classList.add('hidden');
            document.getElementById('category-selection').classList.remove('hidden');
        } else {
            endGame();
        }
    }
}

function endGame() {
    document.getElementById('question-section').classList.add('hidden');

    let winner;
    if (scores.player1 > scores.player2) {
        winner = `${player1} wins!`;
    } else if (scores.player2 > scores.player1) {
        winner = `${player2} wins!`;
    } else {
        winner = "It's a tie!";
    }

    document.getElementById('winner').textContent = winner;
    document.getElementById('game-over').classList.remove('hidden');
}

function restartGame() {
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('player-setup').classList.remove('hidden');
    document.getElementById('scoreboard').classList.add('hidden');
    document.getElementById('category-selection').classList.add('hidden');
    document.getElementById('question-section').classList.add('hidden');

    scores = { player1: 0, player2: 0 };
    usedCategories = [];
    currentQuestionIndex = 0;
    questions = [];
    currentCategory = null;
    currentPlayer = null;
    player1 = '';
    player2 = '';

    document.getElementById('player1-score').textContent = 'Player 1: 0';
    document.getElementById('player2-score').textContent = 'Player 2: 0';
    document.getElementById('player1-name').value = '';
    document.getElementById('player2-name').value = '';
}
