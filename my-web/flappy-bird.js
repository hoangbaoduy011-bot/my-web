const canvas = document.getElementById('flappyBirdCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 600;

// --- Game Variables ---

// Bird
let birdX = 50;
let birdY = 250;
let birdVelocity = 0;
const gravity = 0.5;
const jumpStrength = -8;
const birdWidth = 40;
const birdHeight = 30;

// Pipes
let pipes = [];
const pipeWidth = 120; // Width of the pipes
const pipeGap = 200;   // Vertical gap between pipes
let pipeHeadHeight = 50; // Height of the pipe head image, will be calculated
const pipeColor = '#2E8B57'; // Color of the pipe body. Change this to your liking!
let pipeSpeed = 2;

// Game State
let frame = 0;
let score = 0;
let highScore = localStorage.getItem('flappyBirdHighScore') || 0;
let gameState = 'instructions'; // 'instructions', 'playing', 'paused', 'gameOver'

// Resources
const birdImage = new Image();
const pipeImage = new Image();
const backgroundImage = new Image(); // Background Image
let resourcesLoaded = false;

// Audio
// const flapSound = new Audio('audio/tieng_ting_mp3-www_tiengdong_com.mp3');
// const scoreSound = new Audio('audio/âm-thanh-trả-lời-đúng.mp3');
// const gameOverSound = new Audio('audio/hieu_ung_am_thanh_chien_thang-www_tiengdong_com.mp3');

/**
 * Loads all game resources (images, sounds) before starting.
 */
function loadResources() {
    const birdImagePromise = new Promise((resolve) => {
        birdImage.onload = () => resolve();
        birdImage.onerror = () => {
            console.error("Bird image failed to load.");
            resolve();
        };
        birdImage.src = 'image/New-flappy-birt.png';
    });

    const pipeImagePromise = new Promise((resolve) => {
        pipeImage.onload = () => {
            if (pipeImage.width > 0) {
                pipeHeadHeight = pipeImage.height * (pipeWidth / pipeImage.width);
            }
            resolve();
        };
        pipeImage.onerror = () => {
            console.error("Pipe image failed to load.");
            resolve();
        };
        pipeImage.src = 'image/ong-flappy-birt.png';
    });

    const backgroundImagePromise = new Promise((resolve) => {
        backgroundImage.onload = () => resolve();
        backgroundImage.onerror = () => {
            console.error("Background image failed to load.");
            resolve();
        };
        backgroundImage.src = 'image/Flappy-Bird-Wallpapers .jpg';
    });

    Promise.all([birdImagePromise, pipeImagePromise, backgroundImagePromise]).then(() => {
        resourcesLoaded = true;
        // Bắt đầu vòng lặp game chính
        loop();
    });
}

/**
 * Draws the background on the canvas.
 */
function drawBackground() {
    if (backgroundImage.complete && backgroundImage.naturalHeight !== 0) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    } else {
        // Fallback to a solid color if image fails
        ctx.fillStyle = '#70c5ce'; // Light blue color
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

/**
 * Draws the bird on the canvas.
 */
function drawBird() {
    if (birdImage.complete && birdImage.naturalHeight !== 0) {
        ctx.drawImage(birdImage, birdX, birdY, birdWidth, birdHeight);
    } else {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(birdX, birdY, birdWidth, birdHeight);
    }
}

/**
 * Draws the pipes on the canvas.
 */
function drawPipes() {
    pipes.forEach(pipe => {
        if (pipeImage.complete && pipeImage.naturalHeight !== 0) {
            // Draw bottom pipe
            ctx.drawImage(pipeImage, pipe.x, canvas.height - pipe.bottomHeight, pipeWidth, pipe.bottomHeight);

            // Draw top pipe (flipped vertically)
            ctx.save();
            ctx.translate(pipe.x, pipe.topHeight);
            ctx.scale(1, -1);
            ctx.drawImage(pipeImage, 0, 0, pipeWidth, pipe.topHeight);
            ctx.restore();
        } else {
            // Fallback drawing in case image fails to load
            ctx.fillStyle = 'green';
            ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
            ctx.fillRect(pipe.x, canvas.height - pipe.bottomHeight, pipeWidth, pipe.bottomHeight);
        }
    });
}

/**
 * Updates the bird's position based on gravity.
 */
function updateBird() {
    birdVelocity += gravity;
    birdY += birdVelocity;

    if (birdY + birdHeight > canvas.height || birdY < 0) {
        setGameOver();
    }
}

/**
 * Creates a new pair of pipes with a random gap position.
 */
function createPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    const bottomHeight = canvas.height - topHeight - pipeGap;

    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomHeight: bottomHeight,
        passed: false
    });
}

/**
 * Moves pipes to the left and checks for collisions.
 */
function updatePipes() {
    if (frame % 120 === 0) {
        createPipe();
    }

    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;

        // Score point when bird passes a pipe
        if (!pipe.passed && pipe.x + pipeWidth < birdX) {
            score++;
            pipe.passed = true;
            // scoreSound.play().catch(e => console.error("Error playing score sound:", e));
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('flappyBirdHighScore', highScore);
            }
        }

        // Collision detection with padding to make it more fair
        const collisionPadding = pipeWidth * 0.3; // 30% padding on each side
        const collisionPipeX = pipe.x + collisionPadding;
        const collisionPipeWidth = pipeWidth - 2 * collisionPadding;

        if (
            birdX + birdWidth > collisionPipeX &&
            birdX < collisionPipeX + collisionPipeWidth &&
            (birdY < pipe.topHeight || birdY + birdHeight > canvas.height - pipe.bottomHeight)
        ) {
            setGameOver();
        }
    });

    // Remove pipes that have moved off-screen
    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);
}

/**
 * Draws the current score on the screen.
 */
function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(score, canvas.width / 2, 50);

    if (gameState === 'gameOver' || gameState === 'instructions') {
        ctx.font = '20px Arial';
        ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, 90);
    }
    ctx.textAlign = 'left'; // Reset alignment
}

/**
 * Vẽ màn hình hướng dẫn, tương tự game Snake.
 */
function drawInstructions() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#eaeaea';
    ctx.font = 'bold 35px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🐦 FLAPPY BIRD', canvas.width / 2, 80);
    
    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = '#4CAF50';
    ctx.fillText('HƯỚNG DẪN CHƠI', canvas.width / 2, 150);
    
    ctx.fillStyle = '#eaeaea';
    ctx.font = '18px Arial';
    ctx.fillText('🎯 Mục tiêu: Bay qua các ống để ghi điểm', canvas.width / 2, 200);
    
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#FFC107';
    ctx.fillText('ĐIỀU KHIỂN', canvas.width / 2, 250);
    
    ctx.fillStyle = '#eaeaea';
    ctx.font = '17px Arial';
    ctx.fillText('Space hoặc Click  Bay lên', canvas.width / 2, 290);
    ctx.fillText('P  Tạm dừng / Tiếp tục', canvas.width / 2, 320);
    
    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 22px Arial';
    ctx.fillText('Nhấn Space hoặc Click để bắt đầu', canvas.width / 2, 400);
    
    ctx.textAlign = 'left';
}

/**
 * Vẽ màn hình tạm dừng, tương tự game Snake.
 */
function drawPauseScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#eaeaea';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⏸ TẠM DỪNG', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText('Nhấn P để tiếp tục', canvas.width / 2, canvas.height / 2 + 30);
    ctx.textAlign = 'left';
}

/**
 * Vẽ màn hình kết thúc game.
 */
function drawGameOverScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2);
    ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 30);
    ctx.fillText('Click or Press Space to Restart', canvas.width / 2, canvas.height / 2 + 60);
    ctx.textAlign = 'left';
}

/**
 * Sets the game state to 'gameOver'.
 */
function setGameOver() {
    if (gameState !== 'gameOver') {
        gameState = 'gameOver';
        // gameOverSound.play().catch(e => console.error("Error playing game over sound:", e));
    }
}

/**
 * Resets the game to its initial state to start a new game.
 */
function resetGame() {
    birdY = 250;
    birdVelocity = 0;
    pipes = [];
    score = 0;
    frame = 0;
    gameState = 'playing';
}

/**
 * Vòng lặp game chính.
 */
function loop() {
    // Cập nhật logic game chỉ khi đang chơi
    if (gameState === 'playing') {
        frame++;
        updateBird();
        updatePipes();
    }

    // Luôn vẽ các thành phần cơ bản
    drawBackground();
    drawPipes();
    drawBird();
    drawScore();

    // Vẽ các lớp phủ tùy theo trạng thái game
    if (gameState === 'instructions') {
        drawInstructions();
    } else if (gameState === 'paused') {
        drawPauseScreen();
    } else if (gameState === 'gameOver') {
        drawGameOverScreen();
    }
    
    requestAnimationFrame(loop);
}

/**
 * Khiến chim bay lên.
 */
function birdJump() {
    birdVelocity = jumpStrength;
    // flapSound.play().catch(e => console.error("Error playing flap sound:", e));
}

// Event Listeners
canvas.addEventListener('click', () => {
    switch (gameState) {
        case 'instructions':
            gameState = 'playing';
            birdJump();
            break;
        case 'playing':
            birdJump();
            break;
        case 'gameOver':
            resetGame();
            break;
    }
});

document.addEventListener('keydown', (e) => {
    // Xử lý phím Space để bay, bắt đầu và chơi lại
    if (e.code === 'Space') {
        e.preventDefault();
        switch (gameState) {
            case 'instructions':
                gameState = 'playing';
                birdJump();
                break;
            case 'playing':
                birdJump();
                break;
            case 'gameOver':
                resetGame();
                break;
        }
    }
    
    // Xử lý phím 'P' để tạm dừng/tiếp tục
    if (e.code === 'KeyP') {
        if (gameState === 'playing') {
            gameState = 'paused';
        } else if (gameState === 'paused') {
            gameState = 'playing';
        }
    }
});

// Bắt đầu tải tài nguyên
loadResources();