// Mouse + keyboard input. Mouse clicks land on a panel and go straight to
// the game logic; arrow keys steer the gold crosshair and Space/Enter clicks
// where it sits, so the game is fully playable without a mouse.

import { clickAt, useHint, startGame, nextLevel, startLevel, SCREEN_PLAY, SCREEN_TITLE, SCREEN_LEVEL_CLEAR, SCREEN_WIN, SCREEN_OVER } from './game.js';
import { setMuted, isMuted, sfx } from './audio.js';
import { toField, toPanel } from './render.js';

const CROSSHAIR_STEP = 14;
const CROSSHAIR_FAST = 48;

export function attachInput(canvas, state) {
  canvas.addEventListener('click', (event) => {
    const field = toField(canvas, event.clientX, event.clientY);
    handlePress(state, field.x, field.y);
  });

  canvas.addEventListener('mousemove', (event) => {
    const field = toField(canvas, event.clientX, event.clientY);
    const panel = toPanel(field.x, field.y);
    if (panel) {
      state.crosshair = { x: panel.x, y: panel.y, panel: panel.panel };
    }
  });

  window.addEventListener('keydown', (event) => {
    const ch = state.crosshair;
    const fast = event.shiftKey ? CROSSHAIR_FAST : CROSSHAIR_STEP;
    switch (event.key) {
      case 'ArrowLeft':
        ch.x = Math.max(0, ch.x - fast);
        event.preventDefault();
        break;
      case 'ArrowRight':
        ch.x = Math.min(640, ch.x + fast);
        event.preventDefault();
        break;
      case 'ArrowUp':
        ch.y = Math.max(0, ch.y - fast);
        event.preventDefault();
        break;
      case 'ArrowDown':
        ch.y = Math.min(400, ch.y + fast);
        event.preventDefault();
        break;
      case 'Tab':
        // Hop the crosshair to the other picture.
        ch.panel = 1 - ch.panel;
        event.preventDefault();
        break;
      case ' ':
      case 'Enter':
        if (state.screen === SCREEN_PLAY) {
          clickAtPanel(state, ch.panel, ch.x, ch.y);
        } else {
          advance(state);
        }
        event.preventDefault();
        break;
      case 'h':
      case 'H':
        useHint(state);
        break;
      case 'm':
      case 'M':
        setMuted(!isMuted());
        state.muted = isMuted();
        break;
      case 'r':
      case 'R':
        if (state.screen === SCREEN_PLAY) startLevel(state, state.levelIndex);
        break;
      default:
        break;
    }
  });
}

function clickAtPanel(state, panel, x, y) {
  const before = state.wrongFlash;
  const result = clickAt(state, x, y);
  if (result === 'wrong' && state.wrongFlash) state.wrongFlash.panel = panel;
  return result;
}

// A press (mouse click) at field coordinates.
function handlePress(state, fieldX, fieldY) {
  if (state.screen === SCREEN_PLAY) {
    const panel = toPanel(fieldX, fieldY);
    if (panel) {
      clickAtPanel(state, panel.panel, panel.x, panel.y);
    } else {
      sfx.click();
    }
    return;
  }
  advance(state);
}

function advance(state) {
  if (state.screen === SCREEN_TITLE) {
    sfx.click();
    startGame(state);
  } else if (state.screen === SCREEN_LEVEL_CLEAR) {
    sfx.click();
    nextLevel(state);
  } else if (state.screen === SCREEN_WIN || state.screen === SCREEN_OVER) {
    sfx.click();
    startGame(state);
  }
}
