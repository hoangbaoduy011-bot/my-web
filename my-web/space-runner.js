// Space Runner Game
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Game variables
let player = {
    x: 50,
    y: canvas.height - 60,
    width: 30,
    height: 30,
    color: '#FFD700', // Gold
    velocityY: 0,
    gravity: 0.5,
    jumpStrength: -10
};

let obstacles = [];
let score = 0;
let gameOver = false;
let gameStarted = false;
let gamePaused = false;
let showInstructions = true;
let obstacleSpeed = 3;
let frameCount = 0;

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

function playJump(){ playTone(600, 0.08, 'sine', 0.3); }
function playGameOver(){ playTone(150, 0.2, 'sawtooth', 0.4); }
function playStart(){ playTone(440, 0.05, 'square', 0.2); }

// Colors
const bgColor = '#1a1a2e'; // Dark blue
const obstacleColor = '#e94560'; // Red

// Initialize game
function init() {
    player.y = canvas.height - 60;
    player.velocityY = 0;
    obstacles = [];
    score = 0;
    gameOver = false;
    gameStarted = false;
    gamePaused = false;
    showInstructions = true;
    obstacleSpeed = 3;
    frameCount = 0;
}

// Draw player
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Draw obstacles
function drawObstacles() {
    ctx.fillStyle = obstacleColor;
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

// Update game state
function update() {
    if (!gameStarted || gameOver || gamePaused) return;

    frameCount++;
    score = Math.floor(frameCount / 10);

    // Player gravity
    player.velocityY += player.gravity;
    player.y += player.velocityY;

    // Prevent player from falling through floor
    if (player.y + player.height > canvas.height - 30) {
        player.y = canvas.height - 30 - player.height;
        player.velocityY = 0;
    }

    // Add new obstacles
    if (frameCount % 120 === 0) { // Every 2 seconds (60 frames/sec * 2)
        const obstacleHeight = Math.random() * 50 + 20; // Min 20, Max 70
        obstacles.push({
            x: canvas.width,
            y: canvas.height - 30 - obstacleHeight,
            width: 20,
            height: obstacleHeight
        });
    }

    // Move obstacles
    obstacles.forEach(obstacle => {
        obstacle.x -= obstacleSpeed;

        // Collision detection
        if (
            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y
        ) {
            gameOver = true;
            playGameOver();
        }
    });

    // Remove off-screen obstacles
    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
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
    ctx.fillText('🚀 SPACE RUNNER', canvas.width / 2, 80);

    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = '#4CAF50';
    ctx.fillText('HƯỚNG DẪN CHƠI', canvas.width / 2, 130);

    ctx.fillStyle = '#FFF';
    ctx.font = '18px Arial';
    ctx.fillText('🎯 Mục tiêu: Nhảy qua các chướng ngại vật', canvas.width / 2, 170);

    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#FFC107';
    ctx.fillText('ĐIỀU KHIỂN', canvas.width / 2, 210);

    ctx.fillStyle = '#FFF';
    ctx.font = '17px Arial';
    ctx.fillText('Space hoặc Click chuột  Nhảy', canvas.width / 2, 245);
    ctx.fillText('P  Tạm dừng', canvas.width / 2, 275);

    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#FF5722';
    ctx.fillText('LƯU Ý', canvas.width / 2, 315);

    ctx.fillStyle = '#FFF';
    ctx.font = '17px Arial';
    ctx.fillText('✗ Va chạm chướng ngại vật = Thua', canvas.width / 2, 350);

    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 22px Arial';
    ctx.fillText('Nhấn Space hoặc Click để bắt đầu', canvas.width / 2, 390);

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
    drawPlayer();
    drawObstacles();
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
function jump() {
    if (showInstructions) {
        showInstructions = false;
        gameStarted = true;
        playStart();
    } else if (gameOver) {
        init();
    } else if (!gamePaused && player.velocityY === 0) { // Only jump if on ground
        player.velocityY = player.jumpStrength;
        playJump();
    }
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        jump();
    }

    // Pause/Resume
    if (e.code === 'KeyP' && gameStarted && !gameOver && !showInstructions) {
        gamePaused = !gamePaused;
    }
});

canvas.addEventListener('click', jump);

// Start game
init();
gameLoop();
