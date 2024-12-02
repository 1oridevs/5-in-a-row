# 4-in-a-Row Multiplayer Game

A multiplayer online game of 4-in-a-Row with support for spectators, timers, and real-time gameplay updates. This project includes robust game management, a user-friendly frontend, and dynamic game state updates.

## Features

### Gameplay
- **Create and Join Lobbies**: Players can host a game or join an existing lobby.
- **Two Players per Lobby**: Only two players can play in each lobby, with additional spectators allowed.
- **Timer for Each Move**: A 30-second timer per turn ensures dynamic gameplay. If a player fails to make a move within the allotted time, the turn switches automatically.
- **Game Over Logic**: The game detects when a player has won and prevents further moves. The lobby is closed once the game ends.

### Spectator Mode
- **Watch Games in Progress**: Spectators can join lobbies and view the current game board in real-time.
- **No Interference**: Spectators cannot make moves, ensuring fair gameplay.

### Real-Time Updates
- **Turn-Based Gameplay**: Updates the current turn in real-time for both players and spectators.
- **Timer Countdown**: Displays the remaining time for the current player's move.
- **Dynamic Player List**: Displays connected players and spectators in the lobby.

### User Experience
- **Responsive Design**: The UI adapts to different devices, providing an enjoyable experience on desktops and tablets.
- **Error Messages**: Clear alerts for invalid actions, such as trying to join a full lobby or making a move after the game ends.

## Usage

1. Players can either create a lobby or join an existing one using a unique lobby ID.
2. A game begins once two players have joined the lobby.
3. Players take turns dropping their tokens into the grid to form a vertical, horizontal, or diagonal line of four tokens to win.
4. Spectators can join the lobby at any time to watch the game in progress.

### Timer Rules
- Each player has 30 seconds to make their move. If the timer runs out, the turn automatically switches to the other player.
- The timer stops once the game ends.

## File Structure

### Backend
- `server.js`: Entry point for the Node.js server.
- `gameController.js`: Manages game logic, including player actions and timer checks.
- `gameRoutes.js`: Defines API endpoints for game-related actions.

### Frontend
- `index.html`: Main HTML file for the game interface.
- `script.js`: Handles frontend logic, including game state updates and timer management.
- `style.css`: Provides styling for the game UI.

---

## API Documentation

For details on the API endpoints exposed by the server, including function descriptions and sample usage, refer to the [API Documentation](./usage.md).

---

Feel free to contribute, report issues, or suggest new features. Happy Coding!

---

## [Play the Game](https://five-in-a-row-ahwe.onrender.com)