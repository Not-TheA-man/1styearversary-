const openButton = document.querySelector('.open-note');
const closeButton = document.querySelector('.close-note');
const note = document.querySelector('.love-note');
const nextButton = document.querySelector('.page-next');
const nextPage = document.querySelector('.next-page');
const backButton = document.querySelector('.back-button');
const finalButton = document.querySelector('.final-next');
const crosswordPage = document.querySelector('.crossword-page');
const crosswordBack = document.querySelector('.crossword-back');
const crosswordGrid = document.querySelector('.crossword-grid');
const crosswordStatus = document.querySelector('.crossword-status');
const backgroundMusic = document.querySelector('#background-music');
const musicTrigger = document.querySelector('#music-trigger');
const musicStatus = document.querySelector('#music-status');

backgroundMusic.volume = 0.45;
musicTrigger.addEventListener('click', async () => {
  try {
    if (backgroundMusic.paused) {
      await backgroundMusic.play();
      musicTrigger.textContent = 'pause our song';
    } else {
      backgroundMusic.pause();
      musicTrigger.textContent = 'play our song';
    }
    musicStatus.textContent = '';
  } catch {
    musicStatus.textContent = 'use the play control below';
  }
});

backgroundMusic.addEventListener('pause', () => { musicTrigger.textContent = 'play our song'; });
backgroundMusic.addEventListener('play', () => { musicTrigger.textContent = 'pause our song'; });
backgroundMusic.addEventListener('error', () => { musicStatus.textContent = 'audio could not be loaded'; });
const crosswordEntries = [
  ['where did we go on our 1st date', 'GYPSYCAFE'],
  ['what dessert did you buy for me on our 1st date', 'CHEESECAKE'],
  ['was it day or night when we met on hinge', 'NIGHT'],
  ['what do i love the most about you', 'ARMPITS'],
  ['what do i really love about you', 'SMELL'],
  ['what do i really really love about you', 'LAUGHINGATMYJOKES'],
  ['what is my favorite superhero', 'GREENLANTERN'],
  ['what is my another favorite hero', 'FLASH'],
  ['what is my favorite anime', 'FAIRYTAIL'],
  ['am i smarter than you', 'NON'],
  ['where did we go for our 3rd date', 'GK'],
  ['when did we say love you to each other', '9THNOVEMBER'],
  ['what do you love about me', 'TONGUE'],
  ['who is my 1st kiss', 'ANANYASINGHAL'],
  ['what do i wanna be', 'ASTRONAUT'],
];
const boardSize = 23;
const board = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
const placements = [];

function canPlace(answer, row, column, direction) {
  const rowStep = direction === 'down' ? 1 : 0;
  const columnStep = direction === 'across' ? 1 : 0;
  const endRow = row + rowStep * (answer.length - 1);
  const endColumn = column + columnStep * (answer.length - 1);
  if (row < 0 || column < 0 || endRow >= boardSize || endColumn >= boardSize) return false;
  for (let index = 0; index < answer.length; index += 1) {
    const currentRow = row + rowStep * index;
    const currentColumn = column + columnStep * index;
    const existing = board[currentRow][currentColumn];
    if (existing && existing !== answer[index]) return false;
  }
  return true;
}

function placeEntry(entry, row, column, direction) {
  const [clue, answer] = entry;
  const rowStep = direction === 'down' ? 1 : 0;
  const columnStep = direction === 'across' ? 1 : 0;
  for (let index = 0; index < answer.length; index += 1) {
    const currentRow = row + rowStep * index;
    const currentColumn = column + columnStep * index;
    board[currentRow][currentColumn] = answer[index];
  }
  placements.push({ clue, answer, row, column, direction });
}

placeEntry(crosswordEntries[5], 11, 2, 'across');
const remainingEntries = crosswordEntries.filter((_, index) => index !== 5).sort((a, b) => b[1].length - a[1].length);
remainingEntries.forEach((entry) => {
  let bestPlacement = null;
  placements.forEach((placed) => {
    for (let placedIndex = 0; placedIndex < placed.answer.length; placedIndex += 1) {
      for (let entryIndex = 0; entryIndex < entry[1].length; entryIndex += 1) {
        if (placed.answer[placedIndex] !== entry[1][entryIndex]) continue;
        const direction = placed.direction === 'across' ? 'down' : 'across';
        const row = placed.row + (placed.direction === 'across' ? 0 : placedIndex) - (direction === 'down' ? entryIndex : 0);
        const column = placed.column + (placed.direction === 'down' ? 0 : placedIndex) - (direction === 'across' ? entryIndex : 0);
        if (canPlace(entry[1], row, column, direction)) bestPlacement = { row, column, direction };
      }
    }
  });
  if (bestPlacement) placeEntry(entry, bestPlacement.row, bestPlacement.column, bestPlacement.direction);
});

const numberMap = new Map();
placements.sort((a, b) => a.row - b.row || a.column - b.column).forEach((placement) => {
  const key = `${placement.row}-${placement.column}`;
  if (!numberMap.has(key)) numberMap.set(key, numberMap.size + 1);
  placement.number = numberMap.get(key);
});

const crosswordCellMap = new Map();
for (let row = 0; row < boardSize; row += 1) {
  for (let column = 0; column < boardSize; column += 1) {
    const cell = document.createElement('input');
    cell.className = board[row][column] ? 'crossword-cell' : 'crossword-cell crossword-block';
    cell.type = 'text';
    cell.maxLength = 1;
    cell.autocomplete = 'off';
    cell.dataset.row = row;
    cell.dataset.column = column;
    cell.setAttribute('aria-label', `Row ${row + 1}, column ${column + 1}`);
    if (board[row][column]) crosswordCellMap.set(`${row}-${column}`, cell);
    else cell.disabled = true;
    crosswordGrid.appendChild(cell);
  }
}

const crosswordCells = [...crosswordCellMap.values()];

function addClues(selector, direction) {
  const list = document.querySelector(selector);
  placements.filter((placement) => placement.direction === direction).sort((a, b) => a.number - b.number).forEach((placement) => {
    const item = document.createElement('li');
    item.textContent = placement.clue;
    list.appendChild(item);
  });
}
addClues('.clue-across', 'across');
addClues('.clue-down', 'down');

function focusCrosswordCell(row, column) {
  const nextCell = crosswordCellMap.get(`${row}-${column}`);
  if (nextCell) nextCell.focus();
}

crosswordCells.forEach((cell) => {
  cell.addEventListener('input', () => {
    cell.value = cell.value.replace(/[^a-z]/gi, '').toUpperCase();
    const row = Number(cell.dataset.row);
    const column = Number(cell.dataset.column);
    if (cell.value) {
      let nextColumn = column + 1;
      while (nextColumn < boardSize && !crosswordCellMap.has(`${row}-${nextColumn}`)) nextColumn += 1;
      if (nextColumn < boardSize) focusCrosswordCell(row, nextColumn);
    }
  });
  cell.addEventListener('keydown', (event) => {
    const row = Number(cell.dataset.row);
    const column = Number(cell.dataset.column);
    const directions = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    if (directions[event.key]) {
      event.preventDefault();
      focusCrosswordCell(row + directions[event.key][0], column + directions[event.key][1]);
    } else if (event.key === 'Backspace' && !cell.value && column > 0) {
      let previousColumn = column - 1;
      while (previousColumn >= 0 && !crosswordCellMap.has(`${row}-${previousColumn}`)) previousColumn -= 1;
      if (previousColumn >= 0) focusCrosswordCell(row, previousColumn);
    }
  });
});

function setNoteOpen(isOpen) {
  note.classList.toggle('is-open', isOpen);
  note.setAttribute('aria-hidden', String(!isOpen));
  openButton.setAttribute('aria-expanded', String(isOpen));
  if (isOpen) closeButton.focus();
}

openButton.addEventListener('click', () => setNoteOpen(true));
closeButton.addEventListener('click', () => {
  setNoteOpen(false);
  openButton.focus();
});

nextButton.addEventListener('click', () => {
  note.classList.remove('is-open');
  nextPage.classList.add('is-open');
  nextPage.setAttribute('aria-hidden', 'false');
  nextButton.setAttribute('aria-expanded', 'true');
  backButton.focus();
});

finalButton.addEventListener('click', () => {
  nextPage.classList.remove('is-open');
  nextPage.setAttribute('aria-hidden', 'true');
  crosswordPage.classList.add('is-open');
  crosswordPage.setAttribute('aria-hidden', 'false');
  crosswordBack.focus();
});

backButton.addEventListener('click', () => {
  nextPage.classList.remove('is-open');
  nextPage.setAttribute('aria-hidden', 'true');
  note.classList.add('is-open');
  backButton.blur();
});

crosswordBack.addEventListener('click', () => {
  crosswordPage.classList.remove('is-open');
  crosswordPage.setAttribute('aria-hidden', 'true');
  nextPage.classList.add('is-open');
  nextPage.setAttribute('aria-hidden', 'false');
  finalButton.focus();
});

document.querySelector('.crossword-clear').addEventListener('click', () => {
  crosswordCells.forEach((cell) => { cell.value = ''; cell.classList.remove('is-correct', 'is-wrong'); });
  crosswordStatus.textContent = 'cleared for another try ♡';
});

document.querySelector('.crossword-check').addEventListener('click', () => {
  let correct = 0;
  crosswordCells.forEach((cell) => {
    const answer = board[Number(cell.dataset.row)][Number(cell.dataset.column)];
    cell.classList.toggle('is-correct', cell.value === answer);
    cell.classList.toggle('is-wrong', Boolean(cell.value) && cell.value !== answer);
    if (cell.value === answer) correct += 1;
  });
  crosswordStatus.textContent = correct === crosswordCells.length ? 'you solved our year ♡' : `${correct} of ${crosswordCells.length} squares are right`;
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && crosswordPage.classList.contains('is-open')) {
    crosswordPage.classList.remove('is-open');
    crosswordPage.setAttribute('aria-hidden', 'true');
    nextPage.classList.add('is-open');
    nextPage.setAttribute('aria-hidden', 'false');
    crosswordBack.focus();
  } else if (event.key === 'Escape' && nextPage.classList.contains('is-open')) {
    nextPage.classList.remove('is-open');
    nextPage.setAttribute('aria-hidden', 'true');
    note.classList.add('is-open');
    backButton.focus();
  } else if (event.key === 'Escape' && note.classList.contains('is-open')) {
    setNoteOpen(false);
    openButton.focus();
  }
});
