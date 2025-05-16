/*
  Echo Beat - Rhythm Tap Game
  © 2025 Echo Beat. All rights reserved.
  This software is proprietary. No reuse or redistribution without permission.
  Contact: echobeat.dev@gmail.com
*/

// Echo Beat - Rhythm Game Enhanced 🎵💥🌈
const bgMusic = document.getElementById("bgMusic");

let beatInterval = 2000;
let beatStart = null;
let score = 0;
let timer;
const pulse = document.getElementById("pulse");
const scoreDisplay = document.getElementById("score");
const feedback = document.getElementById("feedback");

const colors = ["#0ff", "#ff0", "#f0f", "#0f0", "#f00", "#00f"];
let colorIndex = 0;

// 🔊 Setup audio
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playClickSound() {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.3);
}

function changePulseColor() {
  colorIndex = (colorIndex + 1) % colors.length;
  const nextColor = colors[colorIndex];
  pulse.style.backgroundColor = nextColor;
  pulse.style.boxShadow = `0 0 20px ${nextColor}`;
}

function startBeat() {
  try {
    bgMusic.play();
  } catch (e) {
    console.log("Autoplay blocked. Waiting for user gesture.");
  }

  beatStart = Date.now();
  pulse.style.animation = `pulse ${beatInterval / 1000}s infinite`;

  changePulseColor();
  playClickSound();

  timer = setInterval(() => {
    beatStart = Date.now();
    changePulseColor();
    playClickSound();
  }, beatInterval);

  gtag('event', 'game_start', {
    'event_category': 'gameplay'
  });
}

function increaseDifficulty() {
  if (beatInterval > 500) {
    beatInterval -= 100;
    clearInterval(timer);
    startBeat();
  }
}

// 🔄 Click & Tap handler (cross-platform)
["click", "touchstart"].forEach(eventType => {
  document.body.addEventListener(eventType, () => {
    const now = Date.now();
    const timeDiff = Math.abs(now - beatStart);

    if (timeDiff <= beatInterval * 0.2) {
      score++;
      feedback.textContent = "Perfect!";
      pulse.classList.add("glow");

      setTimeout(() => {
        pulse.classList.remove("glow");
      }, 200);

      increaseDifficulty();
      try { navigator.vibrate(50); } catch (e) {}

      gtag('event', 'perfect_tap', {
        'event_category': 'gameplay',
        'value': score
      });

    } else {
      gtag('event', 'miss_tap', {
        'event_category': 'gameplay',
        'value': score
      });

      score = 0;
      feedback.textContent = "Miss!";
      beatInterval = 2000;
      clearInterval(timer);
      startBeat();

      gtag('event', 'reset_game', {
        'event_category': 'gameplay'
      });

      try { navigator.vibrate([100, 50, 100]); } catch (e) {}
    }

    scoreDisplay.textContent = `Score: ${score}`;
  });
});

// Register Service Worker (for offline support)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('SW registered ✔️', reg))
      .catch(err => console.warn('SW failed ❌', err.message));
  });
}


startBeat();
document.body.addEventListener("click", () => {
  if (bgMusic.paused) {
    bgMusic.play();
  }
}, { once: true });
