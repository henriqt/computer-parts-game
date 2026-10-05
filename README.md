# Computer Parts Search Game

![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange) ![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow) ![Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen) ![Status](https://img.shields.io/badge/status-partial%20prototype-blue)

A top-down exploration game built with HTML5 Canvas and plain JavaScript, no libraries and no build step. You play a student who must find scattered computer parts and assemble the right machine for the professor, before an exam sabotaged by another student. Made for the Computer Graphics course (Computer Science, UNIFAJ). Look and feel inspired by Pokémon Emerald.

## Features

### Gameplay

- Three connected areas: IT room, hallway, and classroom.
- The professor is an NPC that blocks the way. His dialogue changes after the first conversation.
- On the first conversation, one of three requests is drawn: 3D modeling (Blender), image editing (Photoshop), or AI development.
- Parts are drawn and placed on the map every match, so no two games are the same.
- Game flow: START screen, intro message, search for parts, assembling at the professor's desk, end screen with score.
- Pause with `ESC`.

### Movement and Controls

- Tile-by-tile movement, like classic handheld RPGs.
- Walk or run (hold left `ALT`). A quick tap only turns the character without moving.
- Movement is driven by real time, not frame count, so the speed is the same on any monitor.
- If a key is still held when a step ends, the next step starts right away.
- Camera always follows the player.

### Parts and Scoring

- 4 part types (processor, graphics card, monitor, storage), 3 models each (A, B, C): 12 parts in total.
- The player carries one part of each type. Picking a part shows its description and asks for confirmation. Picking a second part of the same type swaps them, and the old one stays on the map.
- Each part has a score from 1 to 3 for each request, and each request gives a weight to each part type.
- Final score is the sum of `part score x type weight`. The maximum is computed automatically from the best part of each type.
- The computer can be assembled with missing parts. A missing part counts as 0.
- Part placement rules: on tables only (never the professor's) in the classroom, on free floor in other areas, never near doors, arrival points or the start position, and never touching each other. This guarantees a part never blocks a path.

### Rendering

- Fixed 240x160 resolution (Game Boy Advance), scaled by whole numbers (2x, 3x...) to keep pixels sharp and avoid gaps between tiles.
- Tile maps written as text, one character per tile.
- Sprites come from one atlas image per character (16x24 cells). The right side is the left side mirrored.
- Characters are drawn ordered by their `y` position, so whoever is lower on the map is drawn in front.
- Animated doors, stepped fade between areas, paginated message box, and a YES / NO menu.
- If a sprite image fails to load, a colored square with a direction arrow is drawn instead.

### Architecture

- Classic scripts with a fixed load order (no ES modules, so the game runs by double-clicking `index.html`).
- Data separated from logic: maps, parts, requests and texts live in `src/dados/`.
- Three small classes in `src/core/`: `Atlas` (sprites), `Camera`, and `Input` (keyboard, with callbacks).

## Technologies

- HTML5 Canvas (2D context)
- JavaScript (vanilla)
- `requestAnimationFrame` for the game loop
- No frameworks, no dependencies

## Running the Game

### Prerequisites

- Any modern browser.

### Steps

```bash
git clone https://github.com/henriqt/computer-parts-game.git
cd <computer-parts-game>
```

Then double-click `index.html`. No server needed.

## Controls

| Key | Action |
|---|---|
| Arrows / `W` `A` `S` `D` | Walk (a quick tap only turns) |
| Left `ALT` (hold) | Run |
| `Space` | Interact, advance or close messages, confirm in menus |
| `ESC` | Pause and resume |

## Project Structure

```
index.html            canvas and script tags, in order
assets/
  sprites/            character atlas images
  tiles/              tile art (to be added)
referencias/          reference images
src/
  config.js           screen, timings, keys, colors
  main.js             game state, rules and drawing
  core/
    Atlas.js          sprite cutting and drawing
    Camera.js         camera position and tile offset
    Input.js          keyboard state and callbacks
  dados/
    dialogos.js       game texts
    tiles.js          tile types
    mapas.js          layouts, areas and doors
    pecas.js          parts catalog and requests
```

Script order in `index.html` matters: `config`, `dialogos`, `tiles`, `mapas`, `pecas`, `Atlas`, `Camera`, `Input`, `main`.

## Game Data

### Requests and weights

| Request | Processor | Graphics card | Monitor | Storage | Max score |
|---|---|---|---|---|---|
| 3D modeling (Blender) | 2 | 3 | 1 | 1 | 21 |
| Image editing (Photoshop) | 2 | 1 | 3 | 2 | 24 |
| AI development | 2 | 3 | 0 | 2 | 21 |

### Final result

| Score | Result |
|---|---|
| 85% or more | Perfect assembly |
| 60% to 84% | Good assembly |
| 40% to 59% | Works, but could be better |
| Below 40% | Not good enough for the exam |

Parts and result texts are placeholders for now.

## Project Status

Partial prototype. The core gameplay is complete and playable.

### Done

- Tile-by-tile movement with walk, run and turn
- Three areas with animated doors and fade transitions
- Professor NPC with dialogue
- Complete parts system: random placement, pickup, swap, backpack and HUD
- Three requests with different weights and score calculation
- Paginated message box and YES / NO menu
- START, pause and end screens
- Code split into files, with `Atlas`, `Camera` and `Input` as classes

### To Do

- [ ] Real parts, with real names and descriptions
- [ ] Final art for walls and tiles
- [ ] Room exit animation and fade on the hallway ends
- [ ] Time limit for collecting parts
- [ ] More elaborate ending
- [ ] HUD legend showing each square's part type
- [ ] Review whether the monitor makes sense for the AI request (weight is 0 today)
- [ ] Continue the refactor: entities (`Jogador`, `Npc`, `Peca`), `Area` and `Porta`, and a state machine to replace the flags

## Contributing

1. Fork the project.
2. Create your feature branch: `git checkout -b feature/NewFeature`.
3. Commit your changes: `git commit -m 'feat: adds NewFeature'`.
4. Push to the branch: `git push origin feature/NewFeature`.
5. Open a Pull Request.

Keep data out of the logic (maps, texts and parts go in `src/dados/`) and, when adding a `.js` file, add its `<script>` in the right order in `index.html`.