// Snake Game
const canvas = document.getElementById('snakeGame');
const ctx = canvas.getContext('2d');

// Audio functions
let audioCtx = null;
function ensureAudio(){
    if(!audioCtx){ audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }
    if(audioCtx.state==='suspended'){ audioCtx.resume(); }
}

function playTone(frequency, duration, type, volume) {
    ensureAudio();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.value = volume;

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

function playEat(){ playTone(800, 0.08, 'sine', 0.3); }
function playGameOver(){ playTone(150, 0.2, 'sawtooth', 0.4); }
function playStart(){ playTone(440, 0.05, 'square', 0.2); }

// Game settings
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Game variables
let snake = [
    { x: 10, y: 10 }
];
let velocityX = 0;
let velocityY = 0;
let apple = {
    x: 15,
    y: 15
};
let score = 0;
let gameOver = false;
let gameStarted = false;
let gamePaused = false;
let showInstructions = true;
let gameSpeed = 150;
let lastRenderTime = 0;

// Colors
const bgColor = '#1a1a2e';
const snakeColor = '#0f3460';
const snakeHeadColor = '#16213e';
const appleColor = '#e94560';
const gridColor = '#0f1419';
const textColor = '#eaeaea';

// Initialize game
function init() {
    snake = [{ x: 10, y: 10 }];
    velocityX = 0;
    velocityY = 0;
    apple = { x: 15, y: 15 };
    score = 0;
    gameOver = false;
    gameStarted = false;
    gamePaused = false;
    showInstructions = true;
    placeApple();
}

// Place apple at random position
function placeApple() {
    apple.x = Math.floor(Math.random() * tileCount);
    apple.y = Math.floor(Math.random() * tileCount);
    
    // Make sure apple doesn't spawn on snake
    for (let segment of snake) {
        if (segment.x === apple.x && segment.y === apple.y) {
            placeApple();
            return;
        }
    }
}

// Draw grid
function drawGrid() {
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= tileCount; i++) {
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
}

// Draw snake
function drawSnake() {
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head
            ctx.fillStyle = snakeHeadColor;
        } else {
            // Body
            ctx.fillStyle = snakeColor;
        }
        
        ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
        
        // Add shine effect on head
        if (index === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(
                segment.x * gridSize + 2,
                segment.y * gridSize + 2,
                gridSize / 2,
                gridSize / 2
            );
        }
    });
}

// Draw apple
function drawApple() {
    ctx.fillStyle = appleColor;
    ctx.beginPath();
    ctx.arc(
        apple.x * gridSize + gridSize / 2,
        apple.y * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // Add shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(
        apple.x * gridSize + gridSize / 3,
        apple.y * gridSize + gridSize / 3,
        3,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// Update snake position
function updateSnake() {
    if (!gameStarted || gameOver || gamePaused) return;
    
    // Create new head
    let head = {
        x: snake[0].x + velocityX,
        y: snake[0].y + velocityY
    };
    
    // Wrap around walls (xuất hiện bên kia khi chạm tường)
    if (head.x < 0) {
        head.x = tileCount - 1;
    } else if (head.x >= tileCount) {
        head.x = 0;
    }
    
    if (head.y < 0) {
        head.y = tileCount - 1;
    } else if (head.y >= tileCount) {
        head.y = 0;
    }
    
    // Check self collision
    for (let segment of snake) {
        if (segment.x === head.x && segment.y === head.y) {
            gameOver = true;
            playGameOver();
            return;
        }
    }
    
    // Add new head
    snake.unshift(head);
    
    // Check apple collision
    if (head.x === apple.x && head.y === apple.y) {
        score += 10;
        placeApple();
        playEat();
        // Increase speed slightly
        gameSpeed = Math.max(80, gameSpeed - 2);
    } else {
        // Remove tail if no apple eaten
        snake.pop();
    }
}

// Draw score
function drawScore() {
    ctx.fillStyle = textColor;
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Điểm: ' + score, 10, 25);
    ctx.fillText('Độ dài: ' + snake.length, 10, 50);
}

// Draw game over screen
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = textColor;
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = '25px Arial';
    ctx.fillText('Điểm: ' + score, canvas.width / 2, canvas.height / 2);
    ctx.fillText('Độ dài: ' + snake.length, canvas.width / 2, canvas.height / 2 + 35);
    ctx.font = '18px Arial';
    ctx.fillText('Nhấn Space để chơi lại', canvas.width / 2, canvas.height / 2 + 70);
    ctx.textAlign = 'left';
}

// Draw instructions
function drawInstructions() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = textColor;
    ctx.font = 'bold 35px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🐍 SNAKE GAME', canvas.width / 2, 60);
    
    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = '#4CAF50';
    ctx.fillText('HƯỚNG DẪN CHƠI', canvas.width / 2, 110);
    
    ctx.fillStyle = textColor;
    ctx.font = '18px Arial';
    ctx.fillText('🎯 Mục tiêu: Ăn táo để tăng điểm và độ dài', canvas.width / 2, 150);
    
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#FFC107';
    ctx.fillText('ĐIỀU KHIỂN', canvas.width / 2, 190);
    
    ctx.fillStyle = textColor;
    ctx.font = '17px Arial';
    ctx.fillText('← → ↑ ↓  Di chuyển rắn', canvas.width / 2, 220);
    ctx.fillText('P hoặc Space  Tạm dừng', canvas.width / 2, 250);
    
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#FF5722';
    ctx.fillText('LƯU Ý', canvas.width / 2, 290);
    
    ctx.fillStyle = textColor;
    ctx.font = '17px Arial';
    ctx.fillText('✓ Chạm tường sẽ xuất hiện bên kia', canvas.width / 2, 320);
    ctx.fillText('✗ Đụng vào thân mình = Thua', canvas.width / 2, 350);
    
    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 22px Arial';
    ctx.fillText('Nhấn phím bất kỳ để bắt đầu', canvas.width / 2, 390);
    
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
    ctx.fillText('Nhấn P hoặc Space để tiếp tục', canvas.width / 2, canvas.height / 2 + 30);
    ctx.textAlign = 'left';
}

// Game loop
function gameLoop(currentTime) {
    requestAnimationFrame(gameLoop);
    
    const timeSinceLastRender = currentTime - lastRenderTime;
    if (timeSinceLastRender < gameSpeed) return;
    
    lastRenderTime = currentTime;
    
    // Clear canvas
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    drawGrid();
    
    // Update
    updateSnake();
    
    // Draw
    drawApple();
    drawSnake();
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

// Handle keyboard input
document.addEventListener('keydown', (e) => {
    // Start game from instructions
    if (showInstructions) {
        showInstructions = false;
        gameStarted = true;
        velocityX = 1;
        velocityY = 0;
        playStart();
        return;
    }
    
    // Restart from game over
    if (gameOver && e.code === 'Space') {
        init();
        return;
    }
    
    // Pause/Resume
    if ((e.code === 'KeyP' || e.code === 'Space') && gameStarted && !gameOver) {
        gamePaused = !gamePaused;
        e.preventDefault();
        return;
    }
    
    // Don't allow movement when paused
    if (gamePaused) return;
    
    // Prevent snake from reversing
    switch(e.key) {
        case 'ArrowUp':
            if (velocityY !== 1) {
                velocityX = 0;
                velocityY = -1;
            }
            e.preventDefault();
            break;
        case 'ArrowDown':
            if (velocityY !== -1) {
                velocityX = 0;
                velocityY = 1;
            }
            e.preventDefault();
            break;
        case 'ArrowLeft':
            if (velocityX !== 1) {
                velocityX = -1;
                velocityY = 0;
            }
            e.preventDefault();
            break;
        case 'ArrowRight':
            if (velocityX !== -1) {
                velocityX = 1;
                velocityY = 0;
            }
            e.preventDefault();
            break;
    }
});

// Start game
init();
requestAnimationFrame(gameLoop);