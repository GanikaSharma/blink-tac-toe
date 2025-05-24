const categories = {
  Animals: ['🐶', '🐱', '🐵', '🐰', '🐯', '🦁'],
  Food: ['🍕', '🍟', '🍔', '🍩', '🌮', '🍣'],
  Sports: ['⚽', '🏀', '🏈', '🎾', '⚾', '🏓'],
  Nature: ['🌳', '🌞', '🌈', '🌧️', '🔥', '🌊'],
  Faces: ['😀', '😎', '🥳', '😡', '😭', '😴'],
  Tech: ['💻', '🖱️', '📱', '🕹️', '🧠', '⌨️']
};

let board = Array(9).fill(null);
let currentPlayer = 1;
let turnHistory = { 1: [], 2: [] };
let selectedEmojis = { 1: null, 2: null };
let lastVanishedCell = { 1: null, 2: null };
let gameActive = false;
let mode = 'single';
let score = { 1: 0, 2: 0 };
let roundsPlayed = 0;
let emojiWinStats = {};

document.addEventListener('DOMContentLoaded', () => {
  // Load leaderboard data from localStorage
  const storedStats = localStorage.getItem('emojiWinStats');
  if (storedStats) {
    emojiWinStats = JSON.parse(storedStats);
  }

  const player1Select = document.getElementById('player1-category');
  const player2Select = document.getElementById('player2-category');
  const startBtn = document.getElementById('start-game');

  for (const cat in categories) {
    const option = new Option(cat, cat);
    player1Select.add(option.cloneNode(true));
    player2Select.add(option.cloneNode(true));
  }
  document.getElementById('view-stats').addEventListener('click', () => {
    renderStatsTable();
    document.getElementById('category-selection').style.display = 'none';
    document.getElementById('stats-section').style.display = 'block';
  });

  // Back to menu button
  document.getElementById('back-to-menu').addEventListener('click', () => {
    document.getElementById('stats-section').style.display = 'none';
    document.getElementById('category-selection').style.display = 'block';
  });

  // Reset leaderboard button
  document.getElementById('reset-stats').addEventListener('click', () => {
    const confirmReset = confirm("This will clear all emoji win stats. Continue?");
    if (confirmReset) {
      emojiWinStats = {};
      localStorage.removeItem('emojiWinStats');
      renderStatsTable();
    }
  });

  startBtn.addEventListener('click', startGame);
  document.getElementById('restart-btn').addEventListener('click', restartGame);
  document.getElementById('exit-btn').addEventListener('click', exitGame);

  //help button
  document.getElementById('help-btn').addEventListener('click', () => {
    document.getElementById('category-selection').style.display = 'none';
    document.getElementById('rules-section').style.display = 'block';
  });

  document.getElementById('exit-help').addEventListener('click', () => {
    document.getElementById('rules-section').style.display = 'none';
    document.getElementById('category-selection').style.display = 'block';
  });

  // Button click sound
  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const click = document.getElementById('click-sound');
      click.currentTime = 0;
      click.play();
    });
  });


  // Dropdown selection sound
  document.querySelectorAll('select').forEach(select => {
    select.addEventListener('change', () => {
      const selectSound = document.getElementById('select-sound');
      selectSound.currentTime = 0;
      selectSound.play();
    });
  });
});

function startGame() {
  const cat1 = document.getElementById('player1-category').value;
  const cat2 = document.getElementById('player2-category').value;

  mode = document.getElementById('mode-select').value;
  score = { 1: 0, 2: 0 };
  roundsPlayed = 0;
  document.getElementById('score1').textContent = 0;
  document.getElementById('score2').textContent = 0;


  if (cat1 === cat2) {
    alert('Choose different categories for each player!');
    return;
  }

  selectedEmojis[1] = categories[cat1][Math.floor(Math.random() * categories[cat1].length)];
  selectedEmojis[2] = categories[cat2][Math.floor(Math.random() * categories[cat2].length)];

  board = Array(9).fill(null);
  currentPlayer = 1;
  turnHistory = { 1: [], 2: [] };
  lastVanishedCell = { 1: null, 2: null };
  gameActive = true;

  document.getElementById('category-selection').style.display = 'none';
  document.getElementById('game-section').style.display = 'block';
  document.getElementById('exit-btn').style.display = 'inline-block';
  document.getElementById('message').textContent = '';
  document.getElementById('restart-btn').style.display = 'none';
  document.getElementById('turn-player').textContent = currentPlayer;
  document.getElementById('turn-emoji').textContent = selectedEmojis[currentPlayer];

  generateBoard();
}

function generateBoard() {
  const boardDiv = document.getElementById('board');
  boardDiv.innerHTML = '';

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.dataset.index = i;
    cell.classList.remove("winning-cell");
    cell.addEventListener('click', handleCellClick);
    boardDiv.appendChild(cell);
  }
}

function handleCellClick(event) {
  if (!gameActive) return;

  const index = parseInt(event.target.dataset.index);
  const cell = event.target;

  if (board[index]) return;

  if (index === lastVanishedCell[currentPlayer]) {
    alert("You can't place on the cell where your last emoji vanished.");
    return;
  }

  if (turnHistory[currentPlayer].length === 3) {
    const oldest = turnHistory[currentPlayer].shift();
    lastVanishedCell[currentPlayer] = oldest.index;
    const oldCell = document.querySelector(`[data-index='${oldest.index}']`);
    oldCell.classList.add('emoji-vanish');

    board[oldest.index] = null;
    oldCell.textContent = '';
    oldCell.classList.remove('emoji-vanish');
  }

  const emoji = selectedEmojis[currentPlayer];
  board[index] = { player: currentPlayer, emoji };
  cell.textContent = emoji;
  cell.classList.add('emoji-pop');
  setTimeout(() => cell.classList.remove('emoji-pop'), 300);

  document.getElementById(`player${currentPlayer}-sound`).play();
  turnHistory[currentPlayer].push({ index, emoji });

  const winningCombo = checkWinner(currentPlayer);

  if (winningCombo) {
    winningCombo.forEach(i => {
      const winningCell = document.querySelector(`[data-index='${i}']`);
      winningCell.classList.add("winning-cell");
    });

    // Show winner message
    document.getElementById("message").textContent = `Player ${currentPlayer} Wins! 🎉`;
    document.getElementById("message").style.color = "#00ffcc";

    // Update score
    score[currentPlayer]++;
    document.getElementById(`score${currentPlayer}`).textContent = score[currentPlayer];
    roundsPlayed++;

    if (mode === 'single') {
      declareMatchWinner(currentPlayer);
    } else if (mode === 'best3' && roundsPlayed === 3) {
      const winner = score[1] > score[2] ? 1 : 2;
      declareMatchWinner(winner);
    } else {
      setTimeout(restartBoardOnly, 1000);
    }

    gameActive = false;
    document.getElementById("restart-btn").style.display = 'block';
    document.getElementById("exit-btn").style.display = 'none';
    document.getElementById('win-sound').currentTime = 0;
    document.getElementById('win-sound').play();

    // Confetti
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 100);

    return;
  }


  currentPlayer = currentPlayer === 1 ? 2 : 1;
  document.getElementById('turn-player').textContent = currentPlayer;
  document.getElementById('turn-emoji').textContent = selectedEmojis[currentPlayer];
}

function checkWinner(player) {
  const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];

  const currentIndexes = turnHistory[player].map(entry => entry.index);

  return winningCombos.find(combo =>
    combo.every(i => currentIndexes.includes(i))
  );
}


function restartGame() {
  board = Array(9).fill(null);
  gameActive = true;
  currentPlayer = 1;
  turnHistory = { 1: [], 2: [] };
  lastVanishedCell = { 1: null, 2: null };

  document.querySelectorAll('#board div').forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('winning-cell');
  });

  // Hide game UI and show category selection
  document.getElementById('game-section').style.display = 'none';
  document.getElementById('category-selection').style.display = 'block';
  document.getElementById('exit-btn').style.display = 'none';

  // Optional: Reset category dropdowns
  document.getElementById('player1-category').selectedIndex = 0;
  document.getElementById('player2-category').selectedIndex = 0;

  // Reset UI elements
  document.getElementById('message').textContent = '';
  document.getElementById('restart-btn').style.display = 'none';
  document.getElementById('turn-indicator').textContent = `Player ${currentPlayer}'s Turn`;
}

function exitGame() {
  const confirmExit = confirm("⚠️ Are you sure you want to abandon the battlefield?\n\nOptions:\n👀 'No, I fight on!'\n🫡 'Yes, I surrender...'\n🌀 'Let fate decide!'");

  if (confirmExit) {
    gameActive = false;
    board = Array(9).fill(null);

    document.getElementById('game-section').style.display = 'none';
    document.getElementById('category-selection').style.display = 'block';

    document.getElementById('player1-category').selectedIndex = 0;
    document.getElementById('player2-category').selectedIndex = 0;
    document.getElementById('message').textContent = '';
    document.getElementById('restart-btn').style.display = 'none';
    document.getElementById('exit-btn').style.display = 'none';
  }
}

function restartBoardOnly() {
  board = Array(9).fill(null);
  turnHistory = { 1: [], 2: [] };
  lastVanishedCell = { 1: null, 2: null };
  gameActive = true;
  currentPlayer = 1;

  document.querySelectorAll('#board div').forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('winning-cell');
  });

  document.getElementById('message').textContent = '';
  document.getElementById('restart-btn').style.display = 'none';
  document.getElementById('exit-btn').style.display = 'inline-block';
  document.getElementById('turn-indicator').textContent = `Player ${currentPlayer}'s Turn`;

  generateBoard();
}

function declareMatchWinner(winner) {
  const emoji = selectedEmojis[winner];
  if (emojiWinStats[emoji]) {
    emojiWinStats[emoji]++;
  } else {
    emojiWinStats[emoji] = 1;
  }
  localStorage.setItem('emojiWinStats', JSON.stringify(emojiWinStats));

  setTimeout(() => {
    alert(`🏆 Player ${winner} wins the match!`);
    resetToCategorySelection();
  }, 300);
}

function renderStatsTable() {
  const tbody = document.querySelector('#stats-table tbody');
  tbody.innerHTML = '';

  const sortedStats = Object.entries(emojiWinStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // Show only top 5

  sortedStats.forEach(([emoji, count]) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td style="font-size: 1.5rem;">${emoji}</td><td>${count}</td>`;
    tbody.appendChild(row);
  });

  if (sortedStats.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="2">No data yet</td>`;
    tbody.appendChild(row);
  }
}
