# NodeJS Chess

A multiplayer and single-player chess game built with Node.js, Express, and Socket.IO for real-time gameplay, featuring a JavaScript-based chess engine. Idea is to help chess players learn coordinates on the board, only way to play here is by using the standard chess notation in the text field below the board.

![Multiplayer game in action](https://media.discordapp.net/attachments/1105584865048543284/1443243326227615775/MP-example.png?ex=69285c97&is=69270b17&hm=d9aa90fe0b5ec88909fd1b3f47391fc86ce154cbf2cf0ab073fc7471784136d5&=&format=webp&quality=lossless&width=300&height=350)


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
![Start Screen](https://media.discordapp.net/attachments/1105584865048543284/1443245394887970928/Start_Screen.png?ex=69285e84&is=69270d04&hm=f307562d3b968de7d1016f11e6430e15d21178758b4195cba8ff82dbf3aa9eee&=&format=webp&quality=lossless&width=350&height=300)
* **Single-Player Mode** (Pass and Play): Play against yourself or another person on the same screen/browser.
![Pass and Play](https://cdn.discordapp.com/attachments/1105584865048543284/1443246999049867414/PassAndPlay.png?ex=69286002&is=69270e82&hm=6a04c427d22983b0945db57432a091021b44deb1147fb892d4c045e778babe4e&=&format=webp&quality=lossless&width=300&height=370)
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
    git clone https://github.com/KavarodB/nodejschess.git
    cd nodejschess
    ```
2.  **Install dependencies**:
    Make sure you have Node.js and npm installed.
    ```bash
    npm install
    ```
    The key dependencies are `express`, `socket.io` and `socket.io-client`.
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
* Persistent user accounts and ratings.
* More comprehensive test coverage for the chess logic.

## Author

Kaloyan Blagoev (Kavarod)

## License

ISC