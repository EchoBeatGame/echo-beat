/*
  Echo Beat - Rhythm Tap Game
  © 2025 Echo Beat. All rights reserved.
  This software is proprietary. No reuse or redistribution without permission.
  Contact: echobeat.dev@gmail.com
*/

const audio = document.getElementById('audio');
const lanes = document.querySelectorAll('.lane');
const healthFill = document.getElementById('health-fill');
const scoreDisplay = document.getElementById('score');
const menu = document.getElementById('menu');
const startButton = document.getElementById('start-button');
const difficultySelect = document.getElementById('difficulty');

let beatmap = [];
let notes = [];
let score = 0;
let health = 100;
let gameStartTime = 0;
let animationFrameId;

startButton.addEventListener('click', () => {
  const difficulty = difficultySelect.value;
  fetch(`beatmaps/${difficulty}.json`)
    .then(response => response.json())
    .then(data => {
      beatmap = data;
      startGame();
    });
});

function startGame() {
  menu.style.display = 'none';
  score = 0;
  health = 100;
  updateHealthBar();
  updateScore();
  notes = [];
  beatmap.forEach(note => {
    notes.push({ ...note, hit: false });
  });
  audio.currentTime = 0;
  audio.play();
  gameStartTime = performance.now();
  animationFrameId = requestAnimationFrame(gameLoop);
}

function gameLoop(currentTime) {
  const elapsed = (currentTime - gameStartTime) / 1000;
  renderNotes(elapsed);
  checkMisses(elapsed);
  if (health <= 0) {
    endGame();
    return;
  }
  animationFrameId = requestAnimationFrame(gameLoop);
}

function renderNotes(elapsed) {
  lanes.forEach(lane => lane.innerHTML = '');
  notes.forEach(note => {
    if (note.hit) return;
    const timeDiff = note.time - elapsed;
    if (timeDiff < -0.5) return; // Missed
    if (timeDiff > 2) return; // Not yet
    const lane = lanes[note.lane];
    const noteEl = document.createElement('div');
    noteEl.classList.add('note');
    const position = (1 - timeDiff / 2) * (window.innerHeight - 100);
    noteEl.style.top = `${position}px`;
    lane.appendChild(noteEl);
  });
}

function checkMisses(elapsed) {
  notes.forEach(note => {
    if (note.hit) return;
    if (note.time < elapsed - 0.2) {
      note.hit = true;
      health -= 10;
      updateHealthBar();
    }
  });
}

function updateHealthBar() {
  health = Math.max(0, Math.min(100, health));
  healthFill.style.width = `${health}%`;
  if (health > 60) {
    healthFill.style.backgroundColor = 'green';
  } else if (health > 30) {
    healthFill.style.backgroundColor = 'orange';
  } else {
    healthFill.style.backgroundColor = 'red';
  }
}

function updateScore() {
  scoreDisplay.textContent = `Score: ${score}`;
}

function endGame() {
  cancelAnimationFrame(animationFrameId);
  audio.pause();
  alert('Game Over!');
  menu.style.display = 'block';
}

document.addEventListener('keydown', e => {
  const laneIndex = parseInt(e.key) - 1;
  if (laneIndex >= 0 && laneIndex < lanes.length) {
    handleHit(laneIndex);
  }
});

function handleHit(laneIndex) {
  const currentTime = (performance.now() - gameStartTime) / 1000;
  for (let note of notes) {
    if (note.hit || note.lane !== laneIndex) continue;
    const timeDiff = Math.abs(note.time - currentTime);
    if (timeDiff < 0.2) {
      note.hit = true;
      score += 100;
      health += 5;
      updateHealthBar();
      updateScore();
      return;
    }
  }
  // Missed
  health -= 10;
  updateHealthBar();
}
