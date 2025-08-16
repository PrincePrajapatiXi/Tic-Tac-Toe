class TicTacToeGame {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameMode = 'ai';
        this.difficulty = 'medium';
        this.isGameActive = true;
        this.scores = { X: 0, O: 0, draws: 0 };
        this.gameHistory = [];
        this.moveHistory = [];
        this.soundEnabled = true;
        
        this.players = {
            X: 'Player 1',
            O: 'AI'
        };
        
        this.initializeElements();
        this.initializeSounds();
        this.attachEventListeners();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.elements = {
            board: document.getElementById('gameBoard'),
            cells: document.querySelectorAll('.cell'),
            modeButtons: document.querySelectorAll('.mode-btn'),
            difficultySelector: document.getElementById('difficultySelector'),
            difficulty: document.getElementById('difficulty'),
            player1Name: document.getElementById('player1Name'),
            player2Name: document.getElementById('player2Name'),
            player2Input: document.getElementById('player2Input'),
            currentPlayerText: document.getElementById('currentPlayerText'),
            gameMessage: document.getElementById('gameMessage'),
            scoreX: document.getElementById('scoreX'),
            scoreO: document.getElementById('scoreO'),
            scoreDraw: document.getElementById('scoreDraw'),
            scorePlayer1: document.getElementById('scorePlayer1'),
            scorePlayer2: document.getElementById('scorePlayer2'),
            gamesPlayed: document.getElementById('gamesPlayed'),
            winRate: document.getElementById('winRate'),
            restartBtn: document.getElementById('restartBtn'),
            resetScoreBtn: document.getElementById('resetScoreBtn'),
            undoBtn: document.getElementById('undoBtn')
        };
    }
    
    initializeSounds() {
        this.sounds = {
            moveX: document.getElementById('moveXSound'),
            moveO: document.getElementById('moveOSound'),
            win: document.getElementById('winSound'),
            draw: document.getElementById('drawSound'),
            lose: document.getElementById('loseSound')
        };
        
        // Set volume levels
        Object.values(this.sounds).forEach(sound => {
            if (sound) {
                sound.volume = 0.7; // Adjust volume (0.0 to 1.0)
            }
        });
    }
    
    playSound(soundType) {
        if (!this.soundEnabled) return;
        
        const sound = this.sounds[soundType];
        if (sound) {
            sound.currentTime = 0; // Reset to beginning
            sound.play().catch(e => {
                console.log('Sound play failed:', e.message);
            });
        }
    }
    
    attachEventListeners() {
        // Mode selection
        this.elements.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.setGameMode(btn.dataset.mode));
        });
        
        // Difficulty selection
        this.elements.difficulty.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
        });
        
        // Player name inputs
        this.elements.player1Name.addEventListener('input', (e) => {
            this.players.X = e.target.value || 'Player 1';
            this.updateDisplay();
        });
        
        this.elements.player2Name.addEventListener('input', (e) => {
            this.players.O = e.target.value || 'Player 2';
            this.updateDisplay();
        });
        
        // Board clicks
        this.elements.cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.makeMove(index));
        });
        
        // Control buttons
        this.elements.restartBtn.addEventListener('click', () => this.restartGame());
        this.elements.resetScoreBtn.addEventListener('click', () => this.resetScore());
        this.elements.undoBtn.addEventListener('click', () => this.undoMove());
        
        // Sound toggle (if button exists)
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.addEventListener('click', () => this.toggleSound());
        }
    }
    
    setGameMode(mode) {
        this.gameMode = mode;
        
        // Update UI
        this.elements.modeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        if (mode === 'ai') {
            this.elements.difficultySelector.classList.remove('hidden');
            this.elements.player2Input.classList.add('hidden');
            this.players.O = 'AI';
        } else {
            this.elements.difficultySelector.classList.add('hidden');
            this.elements.player2Input.classList.remove('hidden');
            this.players.O = this.elements.player2Name.value || 'Player 2';
        }
        
        this.restartGame();
    }
    
    makeMove(index) {
        if (!this.isGameActive || this.board[index] !== '') return;
        
        // Save move for undo functionality
        this.moveHistory.push({
            board: [...this.board],
            currentPlayer: this.currentPlayer
        });
        
        this.board[index] = this.currentPlayer;
        
        // Play move sound
        if (this.currentPlayer === 'X') {
            this.playSound('moveX');
        } else {
            this.playSound('moveO');
        }
        
        this.updateBoard();
        
        if (this.checkWinner()) {
            this.endGame(this.currentPlayer);
            return;
        }
        
        if (this.isBoardFull()) {
            this.endGame('draw');
            return;
        }
        
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateDisplay();
        
        // AI move
        if (this.gameMode === 'ai' && this.currentPlayer === 'O' && this.isGameActive) {
            setTimeout(() => {
                const aiMove = this.getAIMove();
                if (aiMove !== -1) {
                    this.makeMove(aiMove);
                }
            }, 500 + Math.random() * 1000); // Add human-like delay
        }
    }
    
    getAIMove() {
        switch (this.difficulty) {
            case 'easy':
                return this.getRandomMove();
            case 'medium':
                return Math.random() < 0.7 ? this.getBestMove() : this.getRandomMove();
            case 'hard':
                return Math.random() < 0.9 ? this.getBestMove() : this.getRandomMove();
            case 'impossible':
                return this.getBestMove();
            default:
                return this.getRandomMove();
        }
    }
    
    getRandomMove() {
        const availableMoves = this.board
            .map((cell, index) => cell === '' ? index : null)
            .filter(index => index !== null);
        
        return availableMoves.length > 0 
            ? availableMoves[Math.floor(Math.random() * availableMoves.length)]
            : -1;
    }
    
    getBestMove() {
        let bestScore = -Infinity;
        let bestMove = -1;
        
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                let score = this.minimax(this.board, 0, false);
                this.board[i] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    }
    
    minimax(board, depth, isMaximizing) {
        const winner = this.checkWinnerForBoard(board);
        
        if (winner === 'O') return 10 - depth;
        if (winner === 'X') return depth - 10;
        if (this.isBoardFullForBoard(board)) return 0;
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = this.minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = this.minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }
    
    checkWinner() {
        return this.checkWinnerForBoard(this.board);
    }
    
    checkWinnerForBoard(board) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];
        
        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                if (board === this.board) {
                    this.highlightWinningCells(pattern);
                }
                return board[a];
            }
        }
        
        return null;
    }
    
    isBoardFull() {
        return this.isBoardFullForBoard(this.board);
    }
    
    isBoardFullForBoard(board) {
        return board.every(cell => cell !== '');
    }
    
    highlightWinningCells(pattern) {
        pattern.forEach(index => {
            this.elements.cells[index].classList.add('winning');
        });
    }
    
    endGame(result) {
        this.isGameActive = false;
        
        if (result === 'draw') {
            this.scores.draws++;
            this.elements.gameMessage.textContent = "It's a Draw! 🤝";
            this.playSound('draw'); // Always play draw sound
        } else {
            this.scores[result]++;
            const winnerName = this.players[result];
            this.elements.gameMessage.textContent = `🎉 ${winnerName} Wins!`;
            
            // SOUND LOGIC BASED ON GAME MODE
            if (this.gameMode === 'ai') {
                // AI Mode: Win/Lose sounds based on who wins
                if (result === 'X') {
                    this.playSound('win'); // Player wins against AI
                } else {
                    this.playSound('lose'); // AI wins against player
                }
            } else {
                // Multiplayer Mode: Always play win sound
                this.playSound('win');
            }
        }
        
        this.updateScoreboard();
        this.updateStats();
        
        // Clear move history after game ends
        this.moveHistory = [];
    }
    
    updateBoard() {
        this.elements.cells.forEach((cell, index) => {
            cell.textContent = this.board[index];
            cell.className = 'cell';
            
            if (this.board[index] !== '') {
                cell.classList.add(this.board[index].toLowerCase());
                cell.classList.add('disabled');
            }
        });
        
        // Update undo button state
        this.elements.undoBtn.disabled = this.moveHistory.length === 0 || !this.isGameActive;
    }
    
    updateDisplay() {
        if (this.isGameActive) {
            const currentPlayerName = this.players[this.currentPlayer];
            this.elements.currentPlayerText.textContent = `${currentPlayerName}'s Turn`;
            
            // Update player symbol in indicator
            const symbolElement = document.querySelector('.player-symbol');
            if (symbolElement) {
                symbolElement.textContent = this.currentPlayer;
            }
        }
        
        this.updateScoreboard();
    }
    
    updateScoreboard() {
        this.elements.scoreX.textContent = this.scores.X;
        this.elements.scoreO.textContent = this.scores.O;
        this.elements.scoreDraw.textContent = this.scores.draws;
        this.elements.scorePlayer1.textContent = this.players.X;
        this.elements.scorePlayer2.textContent = this.players.O;
    }
    
    updateStats() {
        const totalGames = this.scores.X + this.scores.O + this.scores.draws;
        this.elements.gamesPlayed.textContent = totalGames;
        
        if (totalGames > 0) {
            const winRate = ((this.scores.X / totalGames) * 100).toFixed(1);
            this.elements.winRate.textContent = `${winRate}%`;
        } else {
            this.elements.winRate.textContent = '0%';
        }
    }
    
    restartGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.isGameActive = true;
        this.moveHistory = [];
        this.elements.gameMessage.textContent = '';
        
        // Clear winning highlights
        this.elements.cells.forEach(cell => {
            cell.classList.remove('winning');
        });
        
        this.updateBoard();
        this.updateDisplay();
    }
    
    resetScore() {
        this.scores = { X: 0, O: 0, draws: 0 };
        this.updateScoreboard();
        this.updateStats();
    }
    
    undoMove() {
        if (this.moveHistory.length === 0 || !this.isGameActive) return;
        
        const lastState = this.moveHistory.pop();
        this.board = lastState.board;
        this.currentPlayer = lastState.currentPlayer;
        
        this.updateBoard();
        this.updateDisplay();
        
        // Clear any game end messages
        this.elements.gameMessage.textContent = '';
        
        // Remove winning highlights
        this.elements.cells.forEach(cell => {
            cell.classList.remove('winning');
        });
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundBtn = document.getElementById('soundToggle');
        if (soundBtn) {
            soundBtn.textContent = this.soundEnabled ? '🔊 Sound On' : '🔇 Sound Off';
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToeGame();
});
