/**
 * TIC TAC TOE ULTIMATE
 * Features:
 * - 2 Player Local & AI Mode
 * - Easy, Medium, and Unbeatable Minimax AI
 * - Synthesized Retro Sound Effects (Web Audio API)
 * - Canvas Confetti Celebration
 * - Animated Strike-Through Line
 * - LocalStorage Persistent Scores
 */

// --- Sound Effects Synthesizer (Web Audio API) ---
class SoundManager {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playMove(isX = true) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = isX ? 'sine' : 'triangle';
    const startFreq = isX ? 440 : 330;
    const endFreq = isX ? 660 : 495;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  playWin() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime + idx * 0.09;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  }

  playTie() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [400, 350, 300];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime + idx * 0.1;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.1, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.15);
    });
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }
}

// --- Confetti Engine ---
class ConfettiEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.colors = ['#38bdf8', '#f43f5e', '#a855f7', '#fbbf24', '#34d399', '#f472b6'];

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(count = 70) {
    this.particles = [];
    const originX = this.canvas.width / 2;
    const originY = this.canvas.height / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 9 + 4;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: Math.random() * 8 + 4,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.22,
        opacity: 1
      });
    }

    if (!this.animationId) {
      this.animate();
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.009;

      if (p.opacity <= 0 || p.y > this.canvas.height) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = Math.max(0, p.opacity);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.animationId = null;
    }
  }
}

// --- Main Game Logic ---
class TicTacToeGame {
  constructor() {
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.isGameActive = true;
    this.mode = 'pve'; // 'pve' or 'pvp'
    this.difficulty = 'hard'; // 'easy', 'medium', 'hard'

    this.scores = {
      x: 0,
      o: 0,
      ties: 0
    };

    this.winningCombos = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    this.sounds = new SoundManager();
    this.confetti = new ConfettiEngine(document.getElementById('confetti-canvas'));

    this.loadScores();
    this.initDOM();
    this.attachEvents();
    this.updateUI();
  }

  initDOM() {
    this.cells = Array.from(document.querySelectorAll('.cell'));
    this.turnIndicator = document.getElementById('turn-indicator');
    this.turnText = document.getElementById('turn-text');
    this.turnDot = document.getElementById('turn-dot');
    this.strikeLine = document.getElementById('strike-line');

    this.scoreXEl = document.getElementById('score-x');
    this.scoreOEl = document.getElementById('score-o');
    this.scoreTiesEl = document.getElementById('score-ties');

    this.labelXEl = document.getElementById('label-x');
    this.labelOEl = document.getElementById('label-o');

    this.cardX = document.getElementById('card-x');
    this.cardO = document.getElementById('card-o');
    this.cardTies = document.getElementById('card-ties');

    this.modePveBtn = document.getElementById('mode-pve');
    this.modePvpBtn = document.getElementById('mode-pvp');
    this.difficultyWrapper = document.getElementById('difficulty-wrapper');
    this.difficultySelect = document.getElementById('difficulty-select');

    this.restartBtn = document.getElementById('btn-restart');
    this.resetScoreBtn = document.getElementById('btn-reset-scores');
    this.soundToggleBtn = document.getElementById('btn-sound-toggle');
    this.soundIcon = document.getElementById('sound-icon');
  }

  attachEvents() {
    this.cells.forEach(cell => {
      cell.addEventListener('click', (e) => this.handleCellClick(e));
    });

    this.modePveBtn.addEventListener('click', () => this.setMode('pve'));
    this.modePvpBtn.addEventListener('click', () => this.setMode('pvp'));

    this.difficultySelect.addEventListener('change', (e) => {
      this.difficulty = e.target.value;
      this.sounds.playClick();
      this.restartGame();
    });

    this.restartBtn.addEventListener('click', () => {
      this.sounds.playClick();
      this.restartGame();
    });

    this.resetScoreBtn.addEventListener('click', () => {
      this.sounds.playClick();
      this.resetScores();
    });

    this.soundToggleBtn.addEventListener('click', () => {
      const enabled = this.sounds.toggle();
      this.soundIcon.textContent = enabled ? '🔊' : '🔇';
      if (enabled) this.sounds.playClick();
    });
  }

  loadScores() {
    try {
      const saved = localStorage.getItem('ttt_scores');
      if (saved) {
        this.scores = JSON.parse(saved);
      }
    } catch (e) {
      // LocalStorage not available or blocked
    }
  }

  saveScores() {
    try {
      localStorage.setItem('ttt_scores', JSON.stringify(this.scores));
    } catch (e) {}
  }

  setMode(mode) {
    if (this.mode === mode) return;
    this.mode = mode;
    this.sounds.playClick();

    if (mode === 'pve') {
      this.modePveBtn.classList.add('active');
      this.modePvpBtn.classList.remove('active');
      this.difficultyWrapper.style.display = 'flex';
      this.labelOEl.textContent = 'AI (O)';
    } else {
      this.modePvpBtn.classList.add('active');
      this.modePveBtn.classList.remove('active');
      this.difficultyWrapper.style.display = 'none';
      this.labelOEl.textContent = 'Player 2 (O)';
    }

    this.restartGame();
  }

  handleCellClick(e) {
    const cell = e.target.closest('.cell');
    if (!cell) return;
    const index = parseInt(cell.dataset.index, 10);

    // If cell already filled or game over or AI turn
    if (this.board[index] !== null || !this.isGameActive) return;
    if (this.mode === 'pve' && this.currentPlayer === 'O') return;

    this.makeMove(index, this.currentPlayer);

    if (this.isGameActive && this.mode === 'pve' && this.currentPlayer === 'O') {
      // Small realistic thinking delay for AI
      setTimeout(() => {
        if (!this.isGameActive) return;
        const aiIndex = this.getAIMove();
        if (aiIndex !== null && aiIndex !== undefined) {
          this.makeMove(aiIndex, 'O');
        }
      }, 350);
    }
  }

  makeMove(index, player) {
    this.board[index] = player;
    this.sounds.playMove(player === 'X');

    const cell = this.cells[index];
    cell.textContent = player === 'X' ? '✕' : '◯';
    cell.classList.add(player.toLowerCase(), 'taken');

    const winInfo = this.checkWin(this.board);

    if (winInfo) {
      this.endGame(winInfo);
    } else if (this.checkTie(this.board)) {
      this.endGame({ winner: 'tie' });
    } else {
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
      this.updateTurnUI();
    }
  }

  checkWin(board) {
    for (const combo of this.winningCombos) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return {
          winner: board[a],
          combo
        };
      }
    }
    return null;
  }

  checkTie(board) {
    return board.every(cell => cell !== null);
  }

  endGame(result) {
    this.isGameActive = false;

    if (result.winner === 'tie') {
      this.scores.ties++;
      this.turnText.innerHTML = `It's a <strong style="color:var(--color-tie)">Tie!</strong>`;
      this.turnDot.className = 'turn-dot';
      this.turnDot.style.background = 'var(--color-tie)';
      this.sounds.playTie();
    } else {
      const isX = result.winner === 'X';
      if (isX) this.scores.x++;
      else this.scores.o++;

      const winnerName = isX ? 'Player X' : (this.mode === 'pve' ? 'AI (O)' : 'Player O');
      const winnerColorClass = isX ? 'x-color' : 'o-color';

      this.turnText.innerHTML = `<strong class="${winnerColorClass}">${winnerName}</strong> Wins! 🎉`;
      this.drawStrikeLine(result.combo);

      result.combo.forEach(idx => {
        this.cells[idx].classList.add('winner');
      });

      this.sounds.playWin();
      this.confetti.burst(80);
    }

    this.saveScores();
    this.updateScoresUI();
  }

  drawStrikeLine(combo) {
    const boardEl = document.getElementById('board');
    const boardRect = boardEl.getBoundingClientRect();
    const cellA = this.cells[combo[0]].getBoundingClientRect();
    const cellC = this.cells[combo[2]].getBoundingClientRect();

    const x1 = cellA.left + cellA.width / 2 - boardRect.left;
    const y1 = cellA.top + cellA.height / 2 - boardRect.top;
    const x2 = cellC.left + cellC.width / 2 - boardRect.left;
    const y2 = cellC.top + cellC.height / 2 - boardRect.top;

    const length = Math.hypot(x2 - x1, y2 - y1);
    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    this.strikeLine.style.width = `${length + 20}px`;
    this.strikeLine.style.height = '6px';
    this.strikeLine.style.left = `${midX}px`;
    this.strikeLine.style.top = `${midY}px`;
    this.strikeLine.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    this.strikeLine.classList.add('show');
  }

  restartGame() {
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.isGameActive = true;

    this.cells.forEach(cell => {
      cell.textContent = '';
      cell.className = 'cell';
    });

    this.strikeLine.className = 'strike-line';
    this.strikeLine.style.width = '0';
    this.updateTurnUI();
  }

  resetScores() {
    this.scores = { x: 0, o: 0, ties: 0 };
    this.saveScores();
    this.updateScoresUI();
    this.restartGame();
  }

  updateTurnUI() {
    if (!this.isGameActive) return;

    const isX = this.currentPlayer === 'X';
    const playerText = isX ? 'Player X' : (this.mode === 'pve' ? 'AI' : 'Player O');
    const colorClass = isX ? 'x-color' : 'o-color';

    this.turnText.innerHTML = `<strong class="${colorClass}">${playerText}</strong>'s Turn`;
    this.turnDot.className = `turn-dot ${isX ? 'x-turn' : 'o-turn'}`;
    this.turnDot.style.background = '';

    if (isX) {
      this.cardX.classList.add('active');
      this.cardO.classList.remove('active');
    } else {
      this.cardO.classList.add('active');
      this.cardX.classList.remove('active');
    }
  }

  updateScoresUI() {
    this.scoreXEl.textContent = this.scores.x;
    this.scoreOEl.textContent = this.scores.o;
    this.scoreTiesEl.textContent = this.scores.ties;
  }

  updateUI() {
    this.updateScoresUI();
    this.updateTurnUI();
  }

  // --- AI Algorithms ---
  getAIMove() {
    const emptyIndices = this.board
      .map((val, idx) => (val === null ? idx : null))
      .filter(val => val !== null);

    if (emptyIndices.length === 0) return null;

    if (this.difficulty === 'easy') {
      // Pure random move
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    if (this.difficulty === 'medium') {
      // 1. Can AI win in one move?
      for (const idx of emptyIndices) {
        this.board[idx] = 'O';
        if (this.checkWin(this.board)) {
          this.board[idx] = null;
          return idx;
        }
        this.board[idx] = null;
      }

      // 2. Can player win in next move? Block them!
      for (const idx of emptyIndices) {
        this.board[idx] = 'X';
        if (this.checkWin(this.board)) {
          this.board[idx] = null;
          return idx;
        }
        this.board[idx] = null;
      }

      // 3. Take center if available
      if (this.board[4] === null && Math.random() > 0.3) {
        return 4;
      }

      // 4. Otherwise random
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    // Master / Hard: Minimax Algorithm
    return this.getBestMinimaxMove();
  }

  getBestMinimaxMove() {
    let bestScore = -Infinity;
    let move = null;

    const availableMoves = this.board
      .map((val, idx) => (val === null ? idx : null))
      .filter(val => val !== null);

    // Fast-path opening: if board is empty, pick a corner or center
    if (availableMoves.length === 9) {
      return 4;
    }

    for (const idx of availableMoves) {
      this.board[idx] = 'O';
      const score = this.minimax(this.board, 0, false, -Infinity, Infinity);
      this.board[idx] = null;

      if (score > bestScore) {
        bestScore = score;
        move = idx;
      }
    }

    return move;
  }

  minimax(board, depth, isMaximizing, alpha, beta) {
    const winResult = this.checkWin(board);
    if (winResult) {
      return winResult.winner === 'O' ? 10 - depth : depth - 10;
    }
    if (this.checkTie(board)) {
      return 0;
    }

    const availableMoves = board
      .map((val, idx) => (val === null ? idx : null))
      .filter(val => val !== null);

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const idx of availableMoves) {
        board[idx] = 'O';
        const evaluation = this.minimax(board, depth + 1, false, alpha, beta);
        board[idx] = null;
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const idx of availableMoves) {
        board[idx] = 'X';
        const evaluation = this.minimax(board, depth + 1, true, alpha, beta);
        board[idx] = null;
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.game = new TicTacToeGame();
});

