// Brain Twist Game
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Game variables
let currentQuestion = null;
let score = 0;
let lives = 3;
let questionCount = 0;
const totalQuestions = 10; // For a simple game
let gameOver = false;
let gameStarted = false;
let gamePaused = false;
let showInstructions = true;

// Audio functions
let audioCtx = null;
function ensureAudio(){
    if(!audioCtx){ audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }
    if(audioCtx.state==='suspended'){ audioCtx.resume(); }
}

function playTone(frequency, duration, type, volume, delay = 0) {
    ensureAudio();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.value = volume;

    oscillator.start(audioCtx.currentTime + delay);
    oscillator.stop(audioCtx.currentTime + delay + duration);
}

function playCorrect(){ playTone(1000, 0.05, 'sine', 0.3); }
function playIncorrect(){ playTone(200, 0.2, 'triangle', 0.3); }
function playGameOver(){ playTone(150, 0.2, 'sawtooth', 0.4); }
function playWin(){ playTone(1300, 0.1, 'sine', 0.4); playTone(1500, 0.1, 'sine', 0.4, 0.1); }
function playStart(){ playTone(440, 0.05, 'square', 0.2); }

// Colors
const bgColor = '#1a1a2e'; // Dark blue
const textColor = '#eaeaea';
const correctColor = '#10b981'; // Green
const incorrectColor = '#ef4444'; // Red

// Initialize game
function init() {
    score = 0;
    lives = 3;
    questionCount = 0;
    gameOver = false;
    gameStarted = false;
    gamePaused = false;
    showInstructions = true;
    generateQuestion();
}

// Generate a new question
function generateQuestion() {
    const num1 = Math.floor(Math.random() * 10) + 1; // 1-10
    const num2 = Math.floor(Math.random() * 10) + 1; // 1-10
    const operator = ['+', '-', '*'][Math.floor(Math.random() * 3)];
    let correctAnswer;

    switch (operator) {
        case '+':
            correctAnswer = num1 + num2;
            break;
        case '-':
            correctAnswer = num1 - num2;
            break;
        case '*':
            correctAnswer = num1 * num2;
            break;
    }

    const questionText = `${num1} ${operator} ${num2} = ?`;
    const answers = generateAnswers(correctAnswer);

    currentQuestion = {
        text: questionText,
        correct: correctAnswer,
        answers: answers
    };
    questionCount++;
}

// Generate multiple-choice answers
function generateAnswers(correctAnswer) {
    const answers = new Set();
    answers.add(correctAnswer);

    while (answers.size < 4) {
        let wrongAnswer = correctAnswer + Math.floor(Math.random() * 10) - 5; // +/- 5 from correct
        if (wrongAnswer === correctAnswer) {
            wrongAnswer += (Math.random() > 0.5 ? 1 : -1);
        }
        answers.add(wrongAnswer);
    }
    return shuffleArray(Array.from(answers));
}

// Shuffle an array (Fisher-Yates algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Draw game elements
function draw() {
    // Clear canvas
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (showInstructions) {
        drawInstructions();
    } else if (gamePaused) {
        drawPauseScreen();
    } else if (gameOver) {
        drawGameOver();
    } else {
        // Draw question
        ctx.fillStyle = textColor;
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(currentQuestion.text, canvas.width / 2, canvas.height / 2 - 80);

        // Draw answers
        const answerBtnWidth = 150;
        const answerBtnHeight = 50;
        const startX = (canvas.width - answerBtnWidth * 2 - 20) / 2;
        const startY = canvas.height / 2;
        const gap = 20;

        currentQuestion.answers.forEach((answer, index) => {
            const row = Math.floor(index / 2);
            const col = index % 2;
            const x = startX + col * (answerBtnWidth + gap);
            const y = startY + row * (answerBtnHeight + gap);

            ctx.fillStyle = '#4f46e5'; // Primary color
            ctx.fillRect(x, y, answerBtnWidth, answerBtnHeight);
            ctx.fillStyle = textColor;
            ctx.font = '20px Arial';
            ctx.fillText(answer, x + answerBtnWidth / 2, y + answerBtnHeight / 2 + 7);
        });

        // Draw score and lives
        ctx.fillStyle = textColor;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Điểm: ${score}`, 10, 25);
        ctx.fillText(`Mạng: ${lives}`, 10, 50);
        ctx.fillText(`Câu: ${questionCount}/${totalQuestions}`, canvas.width - 150, 25);
    }
}

// Handle answer click
function checkAnswer(selectedAnswer) {
    if (gameOver || gamePaused) return;

    if (selectedAnswer === currentQuestion.correct) {
        score += 10;
        playCorrect();
    } else {
        lives--;
        playIncorrect();
    }

    if (lives <= 0) {
        gameOver = true;
        playGameOver();
    } else if (questionCount >= totalQuestions) {
        gameOver = true;
        playWin();
    } else {
        generateQuestion();
    }
}

// Draw instructions
function drawInstructions() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = textColor;
    ctx.font = 'bold 35px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🧠 BRAIN TWIST', canvas.width / 2, 60);

    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = '#4CAF50';
    ctx.fillText('HƯỚNG DẪN CHƠI', canvas.width / 2, 110);

    ctx.fillStyle = textColor;
    ctx.font = '18px Arial';
    ctx.fillText('🎯 Mục tiêu: Trả lời đúng các câu hỏi toán học', canvas.width / 2, 150);

    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#FFC107';
    ctx.fillText('ĐIỀU KHIỂN', canvas.width / 2, 190);

    ctx.fillStyle = textColor;
    ctx.font = '17px Arial';
    ctx.fillText('Click vào đáp án đúng', canvas.width / 2, 225);
    ctx.fillText('P  Tạm dừng', canvas.width / 2, 250);

    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#FF5722';
    ctx.fillText('LƯU Ý', canvas.width / 2, 290);

    ctx.fillStyle = textColor;
    ctx.font = '17px Arial';
    ctx.fillText('✗ Trả lời sai = Mất 1 mạng', canvas.width / 2, 320);
    ctx.fillText('✓ Hoàn thành tất cả câu hỏi để thắng', canvas.width / 2, 345);

    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 22px Arial';
    ctx.fillText('Click để bắt đầu', canvas.width / 2, 385);

    ctx.textAlign = 'left';
}

// Draw pause screen
function drawPauseScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = textColor;
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⏸ TẠM DỪNG', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText('Nhấn P để tiếp tục', canvas.width / 2, canvas.height / 2 + 30);
    ctx.textAlign = 'left';
}

// Draw game over screen
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = textColor;
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(lives <= 0 ? 'GAME OVER' : 'HOÀN THÀNH!', canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = '25px Arial';
    ctx.fillText(`Điểm của bạn: ${score}`, canvas.width / 2, canvas.height / 2);
    ctx.font = '18px Arial';
    ctx.fillText('Click để chơi lại', canvas.width / 2, canvas.height / 2 + 40);
    ctx.textAlign = 'left';
}

// Game loop
function gameLoop() {
    requestAnimationFrame(gameLoop);
    draw();
}

// Event listeners
canvas.addEventListener('click', (event) => {
    if (showInstructions) {
        showInstructions = false;
        gameStarted = true;
        init();
        playStart();
        return;
    }

    if (gameOver) {
        init();
        gameStarted = true;
        return;
    }

    if (gamePaused) return;

    // Check if an answer button was clicked
    const answerBtnWidth = 150;
    const answerBtnHeight = 50;
    const startX = (canvas.width - answerBtnWidth * 2 - 20) / 2;
    const startY = canvas.height / 2;
    const gap = 20;

    const mouseX = event.offsetX;
    const mouseY = event.offsetY;

    currentQuestion.answers.forEach((answer, index) => {
        const row = Math.floor(index / 2);
        const col = index % 2;
        const x = startX + col * (answerBtnWidth + gap);
        const y = startY + row * (answerBtnHeight + gap);

        if (
            mouseX > x &&
            mouseX < x + answerBtnWidth &&
            mouseY > y &&
            mouseY < y + answerBtnHeight
        ) {
            checkAnswer(answer);
        }
    });
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyP' && gameStarted && !gameOver && !showInstructions) {
        gamePaused = !gamePaused;
    }
});

// Start game
init();
gameLoop();