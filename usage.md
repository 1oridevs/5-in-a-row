# API Documentation for "5 in a Row" Game Server

This document describes the API endpoints exposed by the game server. Developers implementing a client to interact with the game can use this guide.

---

## Base URL
**HTTPS**: `https://five-in-a-row-ahwe.onrender.com/api`

---

## Endpoints

### 1. **Create Lobby**
Create a new game lobby.

- **URL**: `/create-lobby`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
      "userId": "string",   // Unique ID of the player
      "nickname": "string" // Player's nickname
  }
  ```
- **Response**:
  ```json
  {
      "lobbyId": "123456"  // Unique ID of the created lobby
  }
  ```
- **Sample Usage**:
  ```bash
  curl -X POST https://five-in-a-row-ahwe.onrender.com/api/create-lobby \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "nickname": "player1"}'
  ```

---

### 2. **Join Lobby**
Join an existing game lobby as a player.

- **URL**: `/join-lobby`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
      "lobby": "123456",    // Lobby ID
      "userId": "string",   // Unique ID of the player
      "nickname": "string"  // Player's nickname
  }
  ```
- **Response**:
  ```json
  {
      "message": "Joined as player",  // Status of the request
      "lobbyId": "123456"            // ID of the lobby joined
  }
  ```
- **Sample Usage**:
  ```bash
  curl -X POST https://five-in-a-row-ahwe.onrender.com/api/join-lobby \
  -H "Content-Type: application/json" \
  -d '{"lobby": "123456", "userId": "user124", "nickname": "player2"}'
  ```

---

### 3. **Join as Spectator**
Join an existing game lobby as a spectator.

- **URL**: `/add-spectator`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
      "lobby": "123456",    // Lobby ID
      "userId": "string",   // Unique ID of the spectator
      "nickname": "string"  // Spectator's nickname
  }
  ```
- **Response**:
  ```json
  {
      "message": "Joined as spectator", // Status of the request
      "lobbyId": "123456"              // ID of the lobby joined
  }
  ```
- **Sample Usage**:
  ```bash
  curl -X POST https://five-in-a-row-ahwe.onrender.com/api/add-spectator \
  -H "Content-Type: application/json" \
  -d '{"lobby": "123456", "userId": "user125", "nickname": "viewer1"}'
  ```

---

### 4. **Make a Move**
Make a move in the game.

- **URL**: `/make-a-move`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
      "lobby": "123456",    // Lobby ID
      "userId": "string",   // Unique ID of the player
      "cell": 5             // Column index (0-14 for a 15x15 grid)
  }
  ```
- **Response**:
  ```json
  {
      "board": [  // Updated game board
          [" ", " ", " ", ...],
          [" ", "X", " ", ...],
          ...
      ],
      "currentPlayer": "string",  // User ID of the player whose turn is next
      "message": null,            // Win message if the game is over
      "moveDeadline": 1693253523  // Next move deadline in milliseconds since epoch
  }
  ```
- **Sample Usage**:
  ```bash
  curl -X POST https://five-in-a-row-ahwe.onrender.com/api/make-a-move \
  -H "Content-Type: application/json" \
  -d '{"lobby": "123456", "userId": "user123", "cell": 5}'
  ```

---

### 5. **Check Timer**
Retrieve the remaining time for the current player's turn.

- **URL**: `/check-timer/:lobby`
- **Method**: `GET`
- **Path Parameters**:
  - `lobby`: The unique ID of the game lobby.
- **Response**:
  ```json
  {
      "board": [  // Current game board
          [" ", " ", " ", ...],
          [" ", "X", " ", ...],
          ...
      ],
      "currentPlayer": "string",  // User ID of the player whose turn is next
      "moveDeadline": 1693253523, // Move deadline in milliseconds since epoch
      "gameOver": false,          // Whether the game is over
      "message": null             // Win message if the game is over
  }
  ```
- **Sample Usage**:
  ```bash
  curl -X GET https://five-in-a-row-ahwe.onrender.com/api/check-timer/123456
  ```

---

### 6. **Get Game State**
Retrieve the current state of the game.

- **URL**: `/game-state/:lobby`
- **Method**: `GET`
- **Path Parameters**:
  - `lobby`: The unique ID of the game lobby.
- **Response**:
  ```json
  {
      "board": [  // Current game board
          [" ", " ", " ", ...],
          [" ", "X", " ", ...],
          ...
      ],
      "currentPlayer": "string",  // User ID of the player whose turn is next
      "players": {                // List of players in the game
          "user123": "player1",
          "user124": "player2"
      },
      "spectators": {             // List of spectators
          "user125": "viewer1"
      },
      "gameOver": false,          // Whether the game is over
      "winner": null,             // User ID of the winner, if any
      "moveDeadline": 1693253523  // Move deadline in milliseconds since epoch
  }
  ```
- **Sample Usage**:
  ```bash
  curl -X GET https://five-in-a-row-ahwe.onrender.com/api/game-state/123456
  ```

---

### 7. **Delete a Lobby**
Remove a lobby after the game is over.

- **URL**: `/delete-lobby/:lobby`
- **Method**: `DELETE`
- **Path Parameters**:
  - `lobby`: The unique ID of the game lobby.
- **Response**:
  ```json
  {
      "message": "Lobby deleted successfully."
  }
  ```
- **Sample Usage**:
  ```bash
  curl -X DELETE https://five-in-a-row-ahwe.onrender.com/api/delete-lobby/123456
  ```

---

## Notes
- All requests and responses use JSON format.
- Ensure secure communication by using the HTTPS base URL.
- A 15x15 grid is used for the game board.

Let me know if you need further details!