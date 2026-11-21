// Game state: screens, levels, scoring, hints, timer. Pure logic, no drawing
// here — render.js paints whatever this holds.

import { LEVELS } from './scenes.js';
import { sfx } from './audio.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_LEVEL_CLEAR = 'level-clear';
export const SCREEN_WIN = 'win';
export const SCREEN_OVER = 'over';

export const POINTS_FOUND = 100;
export const POINTS_HINT_COST = 25;
export const WRONG_TIME_PENALTY = 5;
export const HINTS_PER_LEVEL = 3;

export function newGame() {
  return {
    screen: SCREEN_TITLE,
    levelIndex: 0,
    found: new Set(), // difference ids found on the current level
    hinted: new Set(), // difference ids revealed by a hint
    score: 0,
    totalFound: 0,
    mistakes: 0,
    hintsLeft: HINTS_PER_LEVEL,
    timeLeft: LEVELS[0].timeLimit,
    levelBonus: 0,
    message: '',
    messageUntil: 0,
    wrongFlash: null, // {x, y, panel, until} — red X where a wrong click landed
    now: 0,
    startedAt: 0,
    muted: false,
    crosshair: { x: 320, y: 200, panel: 0 }, // keyboard cursor, panel-space coords
  };
}

export function levelOf(state) {
  return LEVELS[state.levelIndex];
}

export function remaining(state) {
  return levelOf(state).differences.length - state.found.size;
}

export function startLevel(state, index) {
  state.levelIndex = index;
  state.found = new Set();
  state.hinted = new Set();
  state.hintsLeft = HINTS_PER_LEVEL;
  state.timeLeft = LEVELS[index].timeLimit;
  state.screen = SCREEN_PLAY;
  state.message = '';
  state.wrongFlash = null;
  state.crosshair = { x: 320, y: 200, panel: 0 };
}

export function startGame(state) {
  state.score = 0;
  state.totalFound = 0;
  state.mistakes = 0;
  state.levelBonus = 0;
  startLevel(state, 0);
}

function flashMessage(state, text, seconds = 1.6) {
  state.message = text;
  state.messageUntil = state.now + seconds;
}

// A click at panel-space (x, y) on either panel. Returns what happened.
export function clickAt(state, x, y) {
  if (state.screen !== SCREEN_PLAY) return 'ignored';
  const level = levelOf(state);
  for (const diff of level.differences) {
    if (state.found.has(diff.id)) continue;
    const dx = x - diff.x;
    const dy = y - diff.y;
    if (dx * dx + dy * dy <= diff.r * diff.r) {
      state.found.add(diff.id);
      state.totalFound += 1;
      const timeBonus = Math.max(0, Math.round(state.timeLeft));
      state.score += POINTS_FOUND + Math.min(50, timeBonus);
      state.hinted.delete(diff.id);
      sfx.found();
      if (state.found.size === level.differences.length) {
        const bonus = Math.round(state.timeLeft) * 2;
        state.levelBonus = bonus;
        state.score += bonus;
        state.screen = SCREEN_LEVEL_CLEAR;
        if (state.levelIndex === LEVELS.length - 1) {
          state.screen = SCREEN_WIN;
          sfx.win();
        } else {
          sfx.levelClear();
        }
        return 'level-clear';
      }
      flashMessage(state, `Found it — ${diff.label}!`);
      return 'found';
    }
  }
  // Wrong spot: time penalty and a red X flash.
  state.mistakes += 1;
  state.timeLeft = Math.max(0, state.timeLeft - WRONG_TIME_PENALTY);
  state.wrongFlash = { x, y, until: state.now + 0.7 };
  sfx.wrong();
  flashMessage(state, `Not quite — ${WRONG_TIME_PENALTY}s penalty!`, 1.2);
  return 'wrong';
}

export function useHint(state) {
  if (state.screen !== SCREEN_PLAY) return null;
  if (state.hintsLeft <= 0) {
    flashMessage(state, 'No hints left!');
    return null;
  }
  const level = levelOf(state);
  const left = level.differences.filter((d) => !state.found.has(d.id) && !state.hinted.has(d.id));
  if (left.length === 0) return null;
  const pick = left[Math.floor(Math.random() * left.length)];
  state.hintsLeft -= 1;
  state.hinted.add(pick.id);
  state.score = Math.max(0, state.score - POINTS_HINT_COST);
  sfx.hint();
  flashMessage(state, `Hint: look near "${pick.label}"`);
  return pick;
}

export function nextLevel(state) {
  if (state.levelIndex + 1 < LEVELS.length) {
    startLevel(state, state.levelIndex + 1);
    return true;
  }
  return false;
}

export function tick(state, dt) {
  state.now += dt;
  if (state.screen === SCREEN_PLAY) {
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.screen = SCREEN_OVER;
      sfx.wrong();
    }
  }
  if (state.wrongFlash && state.now > state.wrongFlash.until) state.wrongFlash = null;
  if (state.message && state.now > state.messageUntil) state.message = '';
}
