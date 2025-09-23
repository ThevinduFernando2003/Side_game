const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 15, paddleHeight = 100;
const ballRadius = 10;

let player = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#4CAF50",
    score: 0
};

let ai = {
    x: canvas.width - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#F44336",
    score: 0
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballRadius,
    speed: 6,
    vx: 6 * (Math.random() > 0.5 ? 1 : -1),
    vy: 6 * (Math.random() * 2 - 1),
    color: "#fff"
};

// Track time
let startTime = Date.now();

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

function drawNet() {
    ctx.fillStyle = "#fff";
    let netWidth = 4;
    let netHeight = 20;
    for (let i = 0; i < canvas.height; i += 30) {
        ctx.fillRect(canvas.width / 2 - netWidth / 2, i, netWidth, netHeight);
    }
}

function drawText(text, x, y, color, size = "35px") {
    ctx.fillStyle = color;
    ctx.font = `${size} Arial`;
    ctx.fillText(text, x, y);
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 6; // reset base speed
    ball.vx = ball.speed * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = ball.speed * (Math.random() * 2 - 1);
}

canvas.addEventListener('mousemove', function(e) {
    let rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    player.y = mouseY - player.height / 2;
    // Clamp to canvas
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
});

function collision(b, p) {
    return (
        b.x - b.radius < p.x + p.width &&
        b.x + b.radius > p.x &&
        b.y + b.radius > p.y &&
        b.y - b.radius < p.y + p.height
    );
}

function update() {
    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Speed up after 30 seconds
    let elapsed = (Date.now() - startTime) / 1000; // seconds
    if (elapsed > 30 && ball.speed < 12) {
        ball.speed += 0.02; // gradual increase
    }

    // Top and bottom collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.vy = -ball.vy;
    }

    // Player paddle collision
    if (collision(ball, player)) {
        ball.x = player.x + player.width + ball.radius; // Prevent sticking
        let collidePoint = ball.y - (player.y + player.height/2);
        collidePoint = collidePoint / (player.height/2);
        let angle = collidePoint * Math.PI/4;
        let direction = 1;
        ball.vx = direction * ball.speed * Math.cos(angle);
        ball.vy = ball.speed * Math.sin(angle);
    }

    // AI paddle collision
    if (collision(ball, ai)) {
        ball.x = ai.x - ball.radius; // Prevent sticking
        let collidePoint = ball.y - (ai.y + ai.height/2);
        collidePoint = collidePoint / (ai.height/2);
        let angle = collidePoint * Math.PI/4;
        let direction = -1;
        ball.vx = direction * ball.speed * Math.cos(angle);
        ball.vy = ball.speed * Math.sin(angle);
    }

    // Score check
    if (ball.x - ball.radius < 0) {
        ai.score++;
        resetBall();
    }
    else if (ball.x + ball.radius > canvas.width) {
        player.score++;
        resetBall();
    }

    // AI movement (simple)
    let aiCenter = ai.y + ai.height/2;
    if (ball.y < aiCenter - 20) ai.y -= 5;
    else if (ball.y > aiCenter + 20) ai.y += 5;
    // Clamp AI
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > canvas.height) ai.y = canvas.height - ai.height;
}

function render() {
    // Clear
    drawRect(0, 0, canvas.width, canvas.height, "#111");
    // Net
    drawNet();
    // Scores
    drawText(player.score, canvas.width/4, 50, "#4CAF50");
    drawText(ai.score, 3*canvas.width/4, 50, "#F44336");
    // Timer
    let elapsed = Math.floor((Date.now() - startTime)/1000);
    drawText(`⏱ ${elapsed}s`, canvas.width/2 - 40, 50, "#fff", "20px");
    // Paddles
    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);
    // Ball
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

function game() {
    update();
    render();
    requestAnimationFrame(game);
}

game();
