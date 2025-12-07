// City Racer Game
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let audioContext;

function ensureAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playTone(frequency, duration, type = 'sine', volume = 0.5) {
    ensureAudio();
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}

function playStart() {
    playTone(440, 0.1, 'sine', 0.3);
    setTimeout(() => playTone(550, 0.1, 'sine', 0.3), 100);
}

function playCrash() {
    playTone(60, 0.2, 'sawtooth', 0.6);
    setTimeout(() => playTone(30, 0.3, 'square', 0.8), 50);
}

// Game settings
const roadWidth = 200;
const laneWidth = roadWidth / 3;
const playerCarWidth = 40;
const playerCarHeight = 60;

// Game variables
let playerCar = {
    x: canvas.width / 2 - playerCarWidth / 2,
    y: canvas.height - playerCarHeight - 10,
    width: playerCarWidth,
    height: playerCarHeight,
    speed: 5,
    lane: 1 // 0: left, 1: middle, 2: right
};

let opponentCars = [];
let score = 0;
let gameOver = false;
let gameStarted = false;
let gamePaused = false;
let showInstructions = true;
let carSpeed = 5;
let frameCount = 0;

// Colors
const bgColor = '#333'; // Dark grey
const roadColor = '#555'; // Grey
const laneLineColor = '#FFF'; // White
const playerCarColor = '#007bff'; // Blue
const opponentCarColor = '#dc3545'; // Red

// Initialize game
function init() {
    playerCar.x = canvas.width / 2 - playerCarWidth / 2;
    playerCar.y = canvas.height - playerCarHeight - 10;
    playerCar.lane = 1;
    opponentCars = [];
    score = 0;
    gameOver = false;
    gameStarted = false;
    gamePaused = false;
    showInstructions = true;
    carSpeed = 5;
    frameCount = 0;
}

// Draw road
function drawRoad() {
    ctx.fillStyle = roadColor;
    ctx.fillRect(canvas.width / 2 - roadWidth / 2, 0, roadWidth, canvas.height);

    // Draw lane lines
    ctx.fillStyle = laneLineColor;
    for (let i = 0; i < canvas.height; i += 40) {
        ctx.fillRect(canvas.width / 2 - laneWidth / 2, i, 5, 20);
        ctx.fillRect(canvas.width / 2 + laneWidth / 2 - 5, i, 5, 20);
    }
}

// Draw player car
function drawPlayerCar() {
    ctx.fillStyle = playerCarColor;
    ctx.fillRect(playerCar.x, playerCar.y, playerCar.width, playerCar.height);
}

// Draw opponent cars
function drawOpponentCars() {
    ctx.fillStyle = opponentCarColor;
    opponentCars.forEach(car => {
        ctx.fillRect(car.x, car.y, car.width, car.height);
    });
}

// Update game state
function update() {
    if (!gameStarted || gameOver || gamePaused) return;

    frameCount++;
    score = Math.floor(frameCount / 10);

    // Move opponent cars
    opponentCars.forEach(car => {
        car.y += carSpeed;

        // Collision detection
        if (
            playerCar.x < car.x + car.width &&
            playerCar.x + playerCar.width > car.x &&
            playerCar.y < car.y + car.height &&
            playerCar.y + playerCar.height > car.y
        ) {
            gameOver = true;
            playCrash();
        }
    });

    // Remove off-screen opponent cars
    opponentCars = opponentCars.filter(car => car.y < canvas.height);

    // Add new opponent cars
    if (frameCount % 90 === 0) { // Every 1.5 seconds
        const lane = Math.floor(Math.random() * 3);
        const xPos = canvas.width / 2 - roadWidth / 2 + lane * laneWidth + (laneWidth - playerCarWidth) / 2;
        opponentCars.push({
            x: xPos,
            y: -playerCarHeight,
            width: playerCarWidth,
            height: playerCarHeight
        });
    }
}

// Draw score
function drawScore() {
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Điểm: ' + score, 10, 25);
}

// Draw game over screen
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = '25px Arial';
    ctx.fillText('Điểm: ' + score, canvas.width / 2, canvas.height / 2);
    ctx.font = '18px Arial';
    ctx.fillText('Nhấn Space để chơi lại', canvas.width / 2, canvas.height / 2 + 40);
    ctx.textAlign = 'left';
}

// Draw instructions
function drawInstructions() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 35px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏎️ CITY RACER', canvas.width / 2, 80);

    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = '#4CAF50';
    ctx.fillText('HƯỚNG DẪN CHƠI', canvas.width / 2, 130);

    ctx.fillStyle = '#FFF';
    ctx.font = '18px Arial';
    ctx.fillText('🎯 Mục tiêu: Tránh các xe khác để ghi điểm', canvas.width / 2, 170);

    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#FFC107';
    ctx.fillText('ĐIỀU KHIỂN', canvas.width / 2, 210);

    ctx.fillStyle = '#FFF';
    ctx.font = '17px Arial';
    ctx.fillText('← →  Di chuyển xe', canvas.width / 2, 245);
    ctx.fillText('P  Tạm dừng', canvas.width / 2, 275);

    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#FF5722';
    ctx.fillText('LƯU Ý', canvas.width / 2, 315);

    ctx.fillStyle = '#FFF';
    ctx.font = '17px Arial';
    ctx.fillText('✗ Va chạm với xe khác = Thua', canvas.width / 2, 350);

    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 22px Arial';
    ctx.fillText('Nhấn phím bất kỳ để bắt đầu', canvas.width / 2, 390);

    ctx.textAlign = 'left';
}

// Draw pause screen
function drawPauseScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⏸ TẠM DỪNG', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText('Nhấn P để tiếp tục', canvas.width / 2, canvas.height / 2 + 30);
    ctx.textAlign = 'left';
}

// Game loop
function gameLoop() {
    requestAnimationFrame(gameLoop);

    // Clear canvas
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update
    update();

    // Draw
    drawRoad();
    drawOpponentCars();
    drawPlayerCar();
    drawScore();

    // Check game states
    if (showInstructions) {
        drawInstructions();
    } else if (gamePaused) {
        drawPauseScreen();
    } else if (gameOver) {
        drawGameOver();
    }
}

// Handle input
document.addEventListener('keydown', (e) => {
        if (showInstructions) {
            showInstructions = false;
            gameStarted = true;
            playStart();
            return;
        }

        if (gameOver && e.code === 'Space') {
            init();
            playStart();
            return;
        }

    if (gamePaused && e.code === 'KeyP') {
        gamePaused = false;
        return;
    }

    if (gameStarted && !gameOver && !gamePaused) {
        switch (e.code) {
            case 'ArrowLeft':
                if (playerCar.lane > 0) {
                    playerCar.lane--;
                }
                break;
            case 'ArrowRight':
                if (playerCar.lane < 2) {
                    playerCar.lane++;
                }
                break;
            case 'KeyP':
                gamePaused = true;
                break;
        }
        playerCar.x = canvas.width / 2 - roadWidth / 2 + playerCar.lane * laneWidth + (laneWidth - playerCarWidth) / 2;
    }
});

// Start game
init();
gameLoop();
