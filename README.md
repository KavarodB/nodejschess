# NodeJS Chess

A multiplayer and single-player chess game built with Node.js, Express, and Socket.IO for real-time gameplay, featuring a JavaScript-based chess engine.

## Table of Contents

-   [Features](#features)
-   [Project Structure](#project-structure)
-   [Technologies Used](#technologies-used)
-   [Setup and Installation](#setup-and-installation)
-   [How to Run](#how-to-run)
-   [Game Logic Overview](#game-logic-overview)
-   [TODO / Future Enhancements](#todo--future-enhancements)
-   [Author](#author)
-   [License](#license)

## Features

* **Multiplayer Mode**:
    * Play against another player in real-time.
    * Room-based matchmaking: Create a new game room and share the code, or join an existing game.
    * Automatic matchmaking: Find an opponent looking for a game with similar settings.
* **Single-Player Mode** (Pass and Play): Play against yourself or another person on the same screen/browser.
* **Chess Engine**:
    * Supports all standard chess moves including pawn promotion, castling (King-side and Queen-side), and en passant.
    * Check, checkmate, and stalemate detection.
    * Draw conditions (e.g., 50-move rule, insufficient material, threefold repetition - *verify implementation details for these*).
* **Game Settings**:
    * Toggle display of board coordinates.
    * Toggle display of chess pieces (for a "blindfold" style or abstract view).
    * Reduced game history display.
* **Interactive UI**:
    * Visual chessboard with piece movement.
    * Input for moves using standard algebraic notation.
    * Real-time feedback for game state, turns, and errors.

## Project Structure
```bash
/
├── frontend/
│   ├── css/
│   │   └── main.css         # Main styling for the frontend
│   ├── scripts/
│   │   ├── chess_view.js    # Frontend logic for single-player/pass-and-play
│   │   └── index.js         # Frontend logic for multiplayer and main menu
│   ├── chess.html           # HTML for single-player/pass-and-play game
│   └── index.html           # Main HTML for game menu and multiplayer
├── logic/
│   ├── pieces/              # Individual chess piece logic (bishop, king, etc.js)
│   ├── Board.js             # Board representation and core move validation
│   ├── Chess.js             # Main chess game engine, rules, and state
│   ├── Coordinate.js        # Helper for board coordinates
│   ├── Figure.js            # Base class for chess pieces
│   ├── game_behaviour_test.js # Tests for game scenarios
│   └── piece_behaviour_test.js # Tests for individual piece movements
├── src/
│   ├── controllers/
│   │   ├── multiplayerController.js # Handles socket events for multiplayer games
│   │   ├── roomsController.js       # Handles socket events for room-based games
│   │   └── singleplayerController.js # Handles socket events for single-player games
│   ├── models/
│   │   ├── Room.js            # Room class for game sessions
│   │   └── Settings.js        # Settings class for game customization
├── package-lock.json
├── package.json             # Project dependencies and scripts
├── server.js                # Main Node.js server setup with Socket.IO
├── server_old.js            # (An older version of the server, can be noted or removed)
└── utils.js                 # Utility functions (e.g., makeid for room codes)
```

## Technologies Used

* **Backend**: Node.js, Express.js (implied by `server.js` structure, though Express might not be heavily used if only serving static files and sockets)
* **Real-time Communication**: Socket.IO, socket.io-client
* **Frontend**: HTML, CSS, JavaScript (Vanilla)
* **Development**: Nodemon for automatic server restarts

## Setup and Installation

1.  **Clone the repository**:
    ```bash
    git clone <your-repository-url>
    cd nodejschess
    ```
2.  **Install dependencies**:
    Make sure you have Node.js and npm installed.
    ```bash
    npm install
    ```
    The key dependencies are `express`, `socket.io`, `socket.io-client`, and `nodemon` (for development).

## How to Run

1.  **Start the server**:
    * For development (with auto-restart on changes):
        ```bash
        npm run dev
        ```
        This typically uses `nodemon server.js`.
    * For production/standard start:
        ```bash
        npm start
        ```
        This typically uses `node server.js`.

2.  **Open the game in your browser**:
    * The server listens on port 3000 by default.
    * The frontend files (`index.html`, `chess.html`) connect to `http://localhost:3000`.
    * You will likely need to serve the `frontend` directory statically. If `server.js` doesn't do this with Express, you might open `frontend/index.html` directly in your browser (though Socket.IO might need the server for client library access depending on setup).
        *The `corsOptions` in `server.js` suggests the frontend might be served from `http://127.0.0.1:5500` (e.g., by a Live Server extension in VS Code).*

## Game Logic Overview

The core chess engine resides in the `logic/` directory.
* `Chess.js` orchestrates the game, managing turns, history, and win conditions.
* `Board.js` maintains the state of the 8x8 board, piece positions, and handles low-level move validation and execution, including special moves like castling and en passant.
* Individual piece classes (e.g., `Pawn.js`, `King.js`) define the movement rules for each piece type.
* Moves are typically parsed from standard algebraic notation.

## TODO / Future Enhancements
* Implement more robust draw condition checks (e.g., threefold repetition, insufficient material). The `Chess.js` file includes logic for `_drawByInsufficientMaterial`, `_drawByStaleMate`, and `_drawByThreeFoldRep`, but their completeness could be reviewed.
* Add AI for single-player vs. computer mode.
* Improve UI/UX (e.g., drag-and-drop pieces, visual move hints).
* Spectator mode for games.
* Persistent user accounts and ratings.
* More comprehensive test coverage for the chess logic.

## Author

Kaloyan Blagoev (Kavarod)

## License

ISC