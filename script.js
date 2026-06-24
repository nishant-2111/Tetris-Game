const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');
const levelDisplay = document.getElementById('level-display');
const linesDisplay = document.getElementById('lines-display');
const bestDisplay = document.getElementById('best-display');
const streakFill = document.getElementById('streak-fill');
const gameOverOverlay = document.getElementById('game-over-overlay');
const pausedOverlay = document.getElementById('paused-overlay');
const finalScore = document.getElementById('final-score');
const pauseBtn = document.getElementById('pause-btn');

const BLOCK = 30;
const ROWS = 20, COLS = 10;

const COLORS = [
    null,
    { fill: '#AFA9EC', stroke: '#7F77DD' },
    { fill: '#5DCAA5', stroke: '#1D9E75' },
    { fill: '#85B7EB', stroke: '#378ADD' },
    { fill: '#97C459', stroke: '#639922' },
    { fill: '#FAC775', stroke: '#EF9F27' },
    { fill: '#F0997B', stroke: '#D85A30' },
    { fill: '#F4C0D1', stroke: '#D4537E' }
];

const SHAPES = [
    null,
    [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]],
    [[0,1,0],[0,1,0],[1,1,0]],
    [[0,1,0],[0,1,0],[0,1,1]],
    [[1,1,0],[0,1,1],[0,0,0]],
    [[0,1,1],[1,1,0],[0,0,0]],
    [[1,1,1],[0,1,0],[0,0,0]],
    [[1,1],[1,1]]
];

let grid, fallingPiece, nextPiece, score, level, lines, best, paused, gameOver, intervalId;

function init() {
    grid = Array.from({length: ROWS}, () => Array(COLS).fill(0));
    score = 0; level = 1; lines = 0; paused = false; gameOver = false;
    best = parseInt(localStorage.getItem('tetris_best') || '0');
    bestDisplay.textContent = best;
    fallingPiece = randomPiece();
    nextPiece = randomPiece();
    gameOverOverlay.classList.remove('show');
    pausedOverlay.classList.remove('show');
    pauseBtn.textContent = '⏸ PAUSE';
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(tick, getSpeed());
    render();
}

function getSpeed() { return Math.max(80, 500 - (level - 1) * 40); }

function randomPiece() {
    const idx = Math.floor(Math.random() * 7) + 1;
    return { shape: SHAPES[idx].map(r => [...r]), colorIdx: idx, x: 3, y: 0 };
}

function drawBlock(context, x, y, colorIdx) {
    const c = COLORS[colorIdx];
    context.fillStyle = c.fill;
    context.fillRect(x * BLOCK + 1, y * BLOCK + 1, BLOCK - 2, BLOCK - 2);
    context.strokeStyle = c.stroke;
    context.lineWidth = 1.5;
    context.strokeRect(x * BLOCK + 1.75, y * BLOCK + 1.75, BLOCK - 3.5, BLOCK - 3.5);
}

function drawGrid() {
    ctx.fillStyle = '#0f0e1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 0.5;
    for (let r = 0; r <= ROWS; r++) {
        ctx.beginPath(); ctx.moveTo(0, r * BLOCK); ctx.lineTo(canvas.width, r * BLOCK); ctx.stroke();
    }
    for (let c = 0; c <= COLS; c++) {
        ctx.beginPath(); ctx.moveTo(c * BLOCK, 0); ctx.lineTo(c * BLOCK, canvas.height); ctx.stroke();
    }

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (grid[r][c]) drawBlock(ctx, c, r, grid[r][c]);
        }
    }
}

function drawGhost() {
    let ghostY = fallingPiece.y;
    while (!collision(fallingPiece.x, ghostY + 1, fallingPiece.shape)) ghostY++;
    if (ghostY === fallingPiece.y) return;
    const c = COLORS[fallingPiece.colorIdx];
    for (let r = 0; r < fallingPiece.shape.length; r++) {
        for (let col = 0; col < fallingPiece.shape[r].length; col++) {
            if (fallingPiece.shape[r][col]) {
                ctx.globalAlpha = 0.15;
                ctx.fillStyle = c.fill;
                ctx.fillRect((fallingPiece.x + col) * BLOCK + 1, (ghostY + r) * BLOCK + 1, BLOCK - 2, BLOCK - 2);
                ctx.globalAlpha = 1;
            }
        }
    }
}

function drawPiece() {
    for (let r = 0; r < fallingPiece.shape.length; r++) {
        for (let c = 0; c < fallingPiece.shape[r].length; c++) {
            if (fallingPiece.shape[r][c]) {
                drawBlock(ctx, fallingPiece.x + c, fallingPiece.y + r, fallingPiece.colorIdx);
            }
        }
    }
}

function drawNextPiece() {
    nextCtx.fillStyle = '#1a1830';
    nextCtx.fillRect(0, 0, 80, 80);
    const shape = nextPiece.shape;
    const rows = shape.length, cols = shape[0].length;
    const bSize = Math.min(18, Math.floor(68 / Math.max(rows, cols)));
    const offX = Math.floor((80 - cols * bSize) / 2);
    const offY = Math.floor((80 - rows * bSize) / 2);
    const c = COLORS[nextPiece.colorIdx];
    for (let r = 0; r < rows; r++) {
        for (let col = 0; col < cols; col++) {
            if (shape[r][col]) {
                nextCtx.fillStyle = c.fill;
                nextCtx.fillRect(offX + col * bSize + 1, offY + r * bSize + 1, bSize - 2, bSize - 2);
                nextCtx.strokeStyle = c.stroke;
                nextCtx.lineWidth = 1;
                nextCtx.strokeRect(offX + col * bSize + 1.5, offY + r * bSize + 1.5, bSize - 3, bSize - 3);
            }
        }
    }
}

function render() {
    drawGrid();
    drawGhost();
    drawPiece();
    drawNextPiece();
}

function collision(x, y, shape) {
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                const nx = x + c, ny = y + r;
                if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return true;
                if (grid[ny][nx]) return true;
            }
        }
    }
    return false;
}

function lockPiece() {
    for (let r = 0; r < fallingPiece.shape.length; r++) {
        for (let c = 0; c < fallingPiece.shape[r].length; c++) {
            if (fallingPiece.shape[r][c]) {
                grid[fallingPiece.y + r][fallingPiece.x + c] = fallingPiece.colorIdx;
            }
        }
    }
    checkLines();
    fallingPiece = nextPiece;
    nextPiece = randomPiece();
    if (collision(fallingPiece.x, fallingPiece.y, fallingPiece.shape)) {
        endGame();
    }
}

function checkLines() {
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
        if (grid[r].every(c => c !== 0)) {
            grid.splice(r, 1);
            grid.unshift(Array(COLS).fill(0));
            cleared++; r++;
        }
    }
    if (cleared > 0) {
        const pts = [0, 10, 30, 50, 100];
        score += pts[Math.min(cleared, 4)] * level;
        lines += cleared;
        level = Math.floor(lines / 10) + 1;
        clearInterval(intervalId);
        intervalId = setInterval(tick, getSpeed());
        updateUI();
    }
}

function updateUI() {
    scoreDisplay.textContent = score;
    levelDisplay.textContent = level;
    linesDisplay.textContent = lines;
    const pct = Math.min(100, score % 100);
    streakFill.style.width = pct + '%';
    if (score > best) {
        best = score;
        bestDisplay.textContent = best;
        try { localStorage.setItem('tetris_best', best); } catch(e) {}
    }
}

function tick() {
    if (paused || gameOver) return;
    if (!collision(fallingPiece.x, fallingPiece.y + 1, fallingPiece.shape)) {
        fallingPiece.y++;
    } else {
        lockPiece();
    }
    render();
}

function endGame() {
    gameOver = true;
    clearInterval(intervalId);
    finalScore.textContent = 'SCORE: ' + score;
    if (score > best) {
        best = score;
        try { localStorage.setItem('tetris_best', best); } catch(e) {}
        bestDisplay.textContent = best;
    }
    gameOverOverlay.classList.add('show');
}

function rotate() {
    const m = fallingPiece.shape;
    const rotated = m[0].map((_, i) => m.map(row => row[i])).map(r => r.reverse());
    if (!collision(fallingPiece.x, fallingPiece.y, rotated)) {
        fallingPiece.shape = rotated;
    }
}

document.addEventListener('keydown', e => {
    if (gameOver) return;
    if (e.key === 'ArrowLeft') {
        if (!paused && !collision(fallingPiece.x - 1, fallingPiece.y, fallingPiece.shape)) {
            fallingPiece.x--; render();
        }
    } else if (e.key === 'ArrowRight') {
        if (!paused && !collision(fallingPiece.x + 1, fallingPiece.y, fallingPiece.shape)) {
            fallingPiece.x++; render();
        }
    } else if (e.key === 'ArrowDown') {
        if (!paused) tick();
    } else if (e.key === 'ArrowUp') {
        if (!paused) { rotate(); render(); }
    } else if (e.key === ' ') {
        if (!gameOver) {
            paused = !paused;
            pauseBtn.textContent = paused ? '▶ RESUME' : '⏸ PAUSE';
            pausedOverlay.classList.toggle('show', paused);
        }
    }
    if (['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '].includes(e.key)) e.preventDefault();
});

pauseBtn.addEventListener('click', () => {
    if (gameOver) return;
    paused = !paused;
    pauseBtn.textContent = paused ? '▶ RESUME' : '⏸ PAUSE';
    pausedOverlay.classList.toggle('show', paused);
});

document.getElementById('restart-btn').addEventListener('click', init);

init();
