// Boot + main loop for Lantern Lane. The canvas is a fixed 1280x720 logical
// field, scaled by CSS to whatever window it opens in. When the page carries
// ?shot=start|play|end the game stages that screenshot scene instead of the
// title screen and sets window.__shotReady once it has painted twice, so a
// capture script knows the frame is settled.

import { newGame, tick } from './game.js';
import { render, FIELD_W, FIELD_H } from './render.js';
import { attachInput } from './input.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

canvas.width = FIELD_W;
canvas.height = FIELD_H;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

let state = shot ? stageShot(shot) : newGame();
if (shot) state.muted = true;

attachInput(canvas, state);

let last = performance.now();
let paints = 0;

function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  tick(state, dt);
  render(ctx, state);
  paints += 1;
  if (shot && paints === 2) {
    window.__shotReady = true;
  }
  // Keep screen readers in the loop with the current count.
  if (state.screen === 'play') {
    const left = 7 - state.found.size;
    const text = `${left} differences left. Score ${state.score}.`;
    if (statusEl.textContent !== text) statusEl.textContent = text;
  }
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
