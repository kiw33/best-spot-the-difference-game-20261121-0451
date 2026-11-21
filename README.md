# Lantern Lane — Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/kiw33/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/kiw33/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

A spot-the-difference game in three hand-drawn scenes: Mira's Rooftop Garden at dusk, Sari's Night Market, and the Lighthouse Cove. Two near-identical pictures sit side by side — find all 7 differences in each before the clock runs out. Markers ring every difference you find, hints cost points, and wrong clicks cost time.

## Run it

```sh
node --experimental-strip-types main.ts
```

Or serve the game directly — it is plain static files with no build step and no network requests:

```sh
python3 -m http.server 8080 --directory game
# open http://localhost:8080
```

Play with the mouse, or steer the gold crosshair with the arrow keys and press Space. `H` spends a hint, `M` toggles sound, `R` restarts the level.

## How it is built

- `main.ts` — the make.fun entrypoint: copies `game/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored library.
- `game/index.html` + `game/src/*.js` — the whole game, dependency-free ES modules. All art is procedural canvas drawing; all sounds are WebAudio oscillator blips. No image, font or audio files, no network requests.
- `game/src/scenes.js` — the three scenes and their 7 differences each.
- `game/src/game.js` — state, scoring, hints, timer. `game/src/render.js` — everything on screen. `game/src/input.js` — mouse + keyboard. `game/src/shots.js` — the deterministic `?shot=` scenes behind the screenshots.

## Screenshots

`?shot=start`, `?shot=play` and `?shot=end` stage the title screen, a mid-game frame (3 of 7 found, 4 left) and the win screen, each played forward through the real game rules from a fixed state.

---

<sub>Entered on [make.fun](https://make.fun/?ref=zesty-orca-73&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
