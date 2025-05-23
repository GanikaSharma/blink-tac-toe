const categories = {
  Animals: ['🐶', '🐱', '🐵', '🐰'],
  Food: ['🍕', '🍟', '🍔', '🍩'],
  Sports: ['⚽', '🏀', '🏈', '🎾']
};

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
  document.getElementById('message').textContent = '';
  document.getElementById('restart-btn').style.display = 'none';
  document.getElementById('turn-indicator').textContent = `Player ${currentPlayer}'s Turn`;

  generateBoard();
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

  // TODO: Block reuse of vanished cell

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

  currentPlayer = currentPlayer === 1 ? 2 : 1;
  document.getElementById('turn-indicator').textContent = `Player ${currentPlayer}'s Turn`;
}

function restartGame() {
  board = Array(9).fill(null);
  gameActive = true;
  currentPlayer = 1;
  turnHistory = { 1: [], 2: [] };
  lastVanishedCell = { 1: null, 2: null };

  document.getElementById('message').textContent = '';
  document.getElementById('restart-btn').style.display = 'none';
  document.getElementById('turn-indicator').textContent = `Player ${currentPlayer}'s Turn`;

  generateBoard();
}

