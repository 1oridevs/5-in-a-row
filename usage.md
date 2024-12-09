# **Five in a Row Game API Usage**

This document provides a comprehensive guide to using the Five in a Row game API and includes individual feature snippets alongside a full client implementation for convenience.

---

## **Base URL**

All requests are sent to the following base URL:
```plaintext
https://five-in-a-row-ahwe.onrender.com/api
```

---

## **Endpoints**

### 1. **Create Lobby**
- **Endpoint:** `/api/create-lobby`
- **Method:** `POST`
- **Payload:**
  ```json
  {
      "userId": "unique_user_id",
      "nickname": "user_nickname"
  }
  ```
- **Response:**
  ```json
  {
      "lobbyId": "unique_lobby_id"
  }
  ```

### 2. **Join Lobby**
- **Endpoint:** `/api/join-lobby`
- **Method:** `POST`
- **Payload:**
  ```json
  {
      "lobby": "lobby_id",
      "userId": "unique_user_id",
      "nickname": "nickname"
  }
  ```

### 3. **Fetch Game State**
- **Endpoint:** `/api/game-state/{lobbyId}`
- **Method:** `GET`
- **Response:**
  ```json
  {
      "board": [...],
      "currentPlayer": "user_id",
      "players": { ... },
      "winner": "user_id_of_winner" | null,
      "gameOver": true | false,
      "moveDeadline": 1639999999999
  }
  ```

### 4. **Make a Move**
- **Endpoint:** `/api/make-a-move`
- **Method:** `POST`
- **Payload:**
  ```json
  {
      "lobby": "lobby_id",
      "userId": "unique_user_id",
      "cell": 5
  }
  ```

---

## **Feature-Specific Snippets**

### 1. **Create Lobby**
#### Function
```python
import requests

def create_lobby(user_id, nickname):
    payload = {"userId": user_id, "nickname": nickname}
    response = requests.post(f"{API_BASE_URL}/create-lobby", json=payload)
    if response.ok:
        return response.json()["lobbyId"]
    else:
        print(f"Error: {response.json().get('error', 'Failed to create lobby.')}") 
        return None
```
#### Usage
```python
lobby_id = create_lobby(user_id, nickname)
if lobby_id:
    print(f"Lobby created with ID: {lobby_id}")
```

---

### 2. **Join Lobby**
#### Function
```python
def join_lobby(lobby_id, user_id, nickname):
    payload = {"lobby": lobby_id, "userId": user_id, "nickname": nickname}
    response = requests.post(f"{API_BASE_URL}/join-lobby", json=payload)
    if response.ok:
        return True
    else:
        print(f"Error: {response.json().get('error', 'Failed to join lobby.')}")
        return False
```
#### Usage
```python
if join_lobby("123456", user_id, nickname):
    print(f"Successfully joined the lobby: 123456")
```

---

### 3. **Fetch Game State**
#### Function
```python
def fetch_game_state(lobby_id):
    response = requests.get(f"{API_BASE_URL}/game-state/{lobby_id}")
    if response.ok:
        return response.json()
    else:
        print(f"Error: {response.json().get('error', 'Failed to fetch game state.')}")
        return None
```
#### Usage
```python
game_state = fetch_game_state("123456")
if game_state:
    print("Game State:", game_state)
```

---

### 4. **Display Game Board**
#### Function
```python
def display_board(board):
    for row in board:
        print(" | ".join(cell if cell != " " else "." for cell in row))
    print("-" * (len(board[0]) * 4 - 1))
```
#### Usage
```python
display_board(game_state["board"])
```

---

### 5. **Make a Move**
#### Function
```python
def make_move(lobby_id, user_id, column):
    payload = {"lobby": lobby_id, "userId": user_id, "cell": column}
    response = requests.post(f"{API_BASE_URL}/make-a-move", json=payload)
    if response.ok:
        print("Move made successfully.")
        return response.json()
    else:
        print(f"Error: {response.json().get('error', 'Failed to make move.')}")
        return None
```
#### Usage
```python
make_move("123456", user_id, 5)
```

---

### 6. **Monitor Timer**
#### Function
```python
def check_timer(lobby_id):
    response = requests.get(f"{API_BASE_URL}/check-timer/{lobby_id}")
    if response.ok:
        return response.json()
    else:
        print(f"Error: {response.json().get('error', 'Failed to check timer.')}")
        return None
```
#### Usage
```python
timer_info = check_timer("123456")
if timer_info:
    print(f"Time remaining: {max(0, (timer_info['moveDeadline'] - time.time() * 1000) // 1000)} seconds")
```

---

## **Full Client Code**

For convenience, here's the **complete client implementation** that integrates all the above snippets into a playable console-based client.

```python
import requests
import time
import os

API_BASE_URL = "https://five-in-a-row-ahwe.onrender.com/api"

class FiveInARowClient:
    def __init__(self):
        self.user_id = self.generate_user_id()
        self.nickname = None
        self.lobby_id = None

    def clear_console(self):
        os.system("cls" if os.name == "nt" else "clear")

    def display_menu(self):
        while True:
            self.clear_console()
            print("===== 4 in a Row =====")
            choice = input("1. Play\n2. About\n3. Exit\n\nSelect an option (1/2/3): ").strip()
            if choice == "1": self.play_menu()
            elif choice == "2": self.show_about()
            elif choice == "3": break
            else: print("Invalid choice. Try again.")

    def play_menu(self):
        while True:
            self.clear_console()
            print("===== Play Menu =====")
            choice = input("1. Create Lobby\n2. Join Lobby\n3. Back\n\nSelect (1/2/3): ").strip()
            if choice == "1": self.create_lobby()
            elif choice == "2": self.join_lobby()
            elif choice == "3": break
            else: print("Invalid choice. Try again.")

    def create_lobby(self):
        self.nickname = input("Enter your nickname: ").strip()
        if not self.nickname: return print("Nickname is required.")
        payload = {"userId": self.user_id, "nickname": self.nickname}
        response = requests.post(f"{API_BASE_URL}/create-lobby", json=payload)

        if response.ok:
            self.lobby_id = response.json()["lobbyId"]
            print(f"Lobby created! Lobby ID: {self.lobby_id}")
            self.wait_for_players()
        else:
            print("Failed to create lobby. Try again.")

    def join_lobby(self):
        self.lobby_id = input("Enter Lobby ID: ").strip()
        self.nickname = input("Enter your nickname: ").strip()
        if not self.lobby_id or not self.nickname: return print("Lobby ID and Nickname are required.")
        payload = {"lobby": self.lobby_id, "userId": self.user_id, "nickname": self.nickname}
        response = requests.post(f"{API_BASE_URL}/join-lobby", json=payload)

        if response.ok:
            print(f"Joined lobby {self.lobby_id}.")
            self.start_game()
        else:
            print("Failed to join lobby. Try again.")

    def wait_for_players(self):
        print("Waiting for another player to join...")
        while True:
            game_state = self.fetch_game_state()
            if len(game_state.get("players", {})) == 2:
                print("Both players are ready. Starting game...")
                self.start_game()
                break
            time.sleep(2)

    def start_game(self):
        print("Game started!")
        while True:
            game_state = self.fetch_game_state()

            if game_state.get("gameOver"):
                print(f"Game Over: {game_state.get('message', 'Game ended.')}")
                break

            if game_state.get("currentPlayer") == self.user_id:
                print("\nIt's your turn!")
                self.display_board(game_state["board"])
                self.make_move(game_state["board"])
            else:
                print("Waiting for the opponent...")
                time.sleep(2)
        input("\nPress Enter to return to the main menu.")

    def make_move(self, board):
        column = int(input("Enter the column (0-14): ").strip())
        payload = {"lobby": self.lobby_id, "userId": self.user_id, "cell": column}
        response = requests.post(f"{API_BASE_URL}/make-a-move", json=payload)
        if response.ok:
            print("Move made successfully!")
        else:
            print(f"Move failed: {response.json().get('error', 'Unknown error')}")

    def fetch_game_state(self):
        response = requests.get(f"{API_BASE_URL}/game-state/{self.lobby_id}")
        return response.json() if response.ok else {}

    def display_board(self, board):
        print("\n".join(" | ".join(cell if cell != " " else "." for cell in row) for row in board))
        print("-" * 29)

    @staticmethod
    def generate_user_id():
        import random, string
        return "".join(random.choices(string.ascii_lowercase + string.digits, k=8))

    def show_about(self):
        print("\nA strategic multiplayer game. Align 5 blocks to win!")

if __name__ == "__main__":
    FiveInARowClient().display_menu()
```

---

### **How to Use**
1. Copy the full code into a file, e.g., `client.py`.
2. Run using Python:
   ```bash
   python client.py
   ```
3. Follow the interactive menu! 🎉
