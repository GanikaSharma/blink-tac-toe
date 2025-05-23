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

document.addEventListener('DOMContentLoaded', () => {
  const player1Select = document.getElementById('player1-category');
  const player2Select = document.getElementById('player2-category');
  const startBtn = document.getElementById('start-game');

  for (const cat in categories) {
    const option = new Option(cat, cat);
    player1Select.add(option.cloneNode(true));
    player2Select.add(option.cloneNode(true));
  }

  startBtn.addEventListener('click', startGame);
  document.getElementById('restart-btn').addEventListener('click', restartGame);
});

function startGame() {
  const cat1 = document.getElementById('player1-category').value;
  const cat2 = document.getElementById('player2-category').value;

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
  document.getElementById('turn-indicator').textContent = `Player ${currentPlayer}'s Turn`;

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
    board[oldest.index] = null;
    document.querySelector(`[data-index='${oldest.index}']`).textContent = '';
  }

  const emoji = selectedEmojis[currentPlayer];
  board[index] = { player: currentPlayer, emoji };
  cell.textContent = emoji;
  turnHistory[currentPlayer].push({ index, emoji });

  const winningCombo = checkWinner(currentPlayer);
  if (winningCombo) {
    winningCombo.forEach(i => {
      const winningCell = document.querySelector(`[data-index='${i}']`);
      winningCell.classList.add("winning-cell");
    });
    document.getElementById("message").textContent = `Player ${currentPlayer} Wins! 🎉`;
    document.getElementById("message").style.color = currentPlayer === 1 ? "#00ffcc" : "#00ffcc";
    gameActive = false;
    document.getElementById('exit-btn').style.display = 'none';
    document.getElementById("restart-btn").style.display = 'block';
    return;
  }

  currentPlayer = currentPlayer === 1 ? 2 : 1;
  document.getElementById('turn-indicator').textContent = `Player ${currentPlayer}'s Turn`;
}

function checkWinner(player) {
  const playerCells = board
    .map((val, idx) => (val && val.player === player ? idx : null))
    .filter(idx => idx !== null);

  const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]           // diagonals
  ];

  for (let combo of winningCombos) {
    if (combo.every(i => playerCells.includes(i))) {
      return combo; // return the winning cells
    }
  }

  return null;
}
function restartGame() {
  board = Array(9).fill(null);
  gameActive = true;
  currentPlayer = 1;
  turnHistory = { 1: [], 2: [] };
  lastVanishedCell = { 1: null, 2: null };

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