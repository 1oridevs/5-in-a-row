# Building a Python Client for "5 in a Row"

## Introduction
Welcome to the guide for building a Python client for the "4 in a Row" game! In this guide, you'll learn how to create a client that interacts with a game server, handles API requests, and plays the game strategically.

You’ll use Python and its `requests` library to accomplish this task.

---

## Steps to Create the Client

### Step 1: Understand the Game API

The server provides the following endpoints:

- **Create a Lobby**: Start a new game and generate a lobby ID.
- **Join a Lobby**: Join an existing game using a lobby ID.
- **Game State**: Fetch the current state of the game.
- **Make a Move**: Submit your move to the server.

Write down how these endpoints work and what inputs/outputs they expect. This information will help you construct API requests.

---

### Step 2: Plan Your Client

Your client will include the following features:

- **A Main Menu** that lets users:
Play the game (Create or Join a lobby).

- **View an About page**.

- **Exit the program**.

#### Game logic to:

1. Continuously fetch the game state.
2. Determine whose turn it is.
3. Make a move when it's your turn.

Sketch out the structure of your program. Consider how you'll organize the code into functions and a class.


---

### Step 3: Implement the Basics

Create the Client Class
Define a FourInARowClient class with attributes to store:

user_id (a unique identifier for each player),
nickname (the player's name),
lobby_id (the game lobby ID).

```python 
class FourInARowClient:
```

Create a method to generate a random user_id using Python’s random library.

```python
import random, string

def generate_user_id():
    return "".join(random.choices(string.ascii_lowercase + string.digits, k=8))
```

---

### Step 4: Build the Menu System

Design a menu system with options for:

- **Play**:
Ask the user if they want to Create or Join a lobby.

- **About**:
Display information about the game.

- **Exit**:
Exit the program.
Use a loop to keep showing the menu until the user decides to exit.

### Step 5: Connect to the Server
#### Create a Lobby
Use the API to create a lobby. Send a POST request with the user_id and nickname, and display the generated lobby_id.

#### Join a Lobby
Prompt the user for a lobby ID and join the game by sending a POST request with the lobby ID, user_id, and nickname.

### Step 6: Handle Game State
Write a function to fetch the game state using the GET API endpoint. This will provide:

**1. The current board.**
**2. The player whose turn it is.**
**3. Whether the game is over.**
**4. Display the Board**
**5. Design a function to print the game board in the terminal. Use a loop to iterate over rows and columns.**

```python
def display_board(board):
    for row in board:
        print(" | ".join(cell if cell != " " else "." for cell in row))
```

### Step 7: Make a Move
Write logic to:

1. Identify valid moves (columns that aren't full).
2. Allow the player to choose a move.
3. Submit the move using the POST /make-a-move endpoint.


### Step 8: Add Strategy
Enhance the client to make smarter moves:

Check if there’s a winning move and play it.
Block the opponent’s winning move if possible.
Use basic scoring to select the best move otherwise.

### Step 9: Handle Game Over
Check if the game is over after every move. If the game is over, display the winner and return to the main menu.

Bonus: Add Polishing Touches
Add input validation (e.g., prevent invalid moves).
Optimize the code to improve performance.
Include comments and docstrings for better readability.
What You’ll Learn
By completing this project, you’ll gain hands-on experience with:

Writing a client for a REST API.
Using Python for HTTP requests.
Implementing basic game logic.
Developing strategic decision-making algorithms.
Next Steps
Once you've built the client:

Test it thoroughly against other players or bots.
Challenge yourself by implementing advanced features, like AI-based strategies.
Happy coding!