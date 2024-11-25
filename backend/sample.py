import requests
import time
import os

API_BASE_URL = "https://five-in-a-row-ahwe.onrender.com"

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
                opponent = game_state["players"][game_state["currentPlayer"]]
                print(f"Waiting for {opponent} to play...")
                time.sleep(2)
        input("\nPress Enter to return to the main menu.")

    def make_move(self, board):
        move = self.find_best_move(board)
        if move is not None:
            payload = {"lobby": self.lobby_id, "userId": self.user_id, "cell": move}
            response = requests.post(f"{API_BASE_URL}/make-a-move", json=payload)
            if response.ok:
                print(f"Move successful: Column {move}")
            else:
                print(f"Move failed: {response.json().get('error', 'Unknown error')}")
        else:
            print("No valid moves available.")

    def find_best_move(self, board):

        opponent_id = self.get_opponent_id()

        for col in range(len(board[0])):
            if self.is_valid_move(board, col):
                # Check for a winning move
                if self.check_win(self.simulate_move(board, col, self.user_id), self.user_id):
                    return col

                # Check for a blocking move
                if self.check_win(self.simulate_move(board, col, opponent_id), opponent_id):
                    return col

        # No strategic move found; pick the first available column
        return next((col for col in range(len(board[0])) if self.is_valid_move(board, col)), None)


    def check_win(self, board, player):
        rows, cols, target = len(board), len(board[0]), 4
        for r in range(rows):
            for c in range(cols - target + 1):
                if all(board[r][c + i] == player for i in range(target)): return True
        for c in range(cols):
            for r in range(rows - target + 1):
                if all(board[r + i][c] == player for i in range(target)): return True
        for r in range(rows - target + 1):
            for c in range(cols - target + 1):
                if all(board[r + i][c + i] == player for i in range(target)): return True
                if all(board[r + target - 1 - i][c + i] == player for i in range(target)): return True
        return False

    def fetch_game_state(self):
        response = requests.get(f"{API_BASE_URL}/game-state/{self.lobby_id}")
        return response.json() if response.ok else {}

    def display_board(self, board):
        print("\n".join(" | ".join(cell if cell != " " else "." for cell in row) for row in board))
        print("-" * 29)

    def is_valid_move(self, board, col):
        return board[0][col] == " "

    def simulate_move(self, board, col, player):
        temp_board = [row[:] for row in board]
        for row in reversed(temp_board):
            if row[col] == " ":
                row[col] = player
                break
        return temp_board

    def get_opponent_id(self):
        for pid in self.fetch_game_state().get("players", {}).keys():
            if pid != self.user_id: return pid
        return None

    @staticmethod
    def generate_user_id():
        import random, string
        return "".join(random.choices(string.ascii_lowercase + string.digits, k=8))

    def show_about(self):
        self.clear_console()
        print("===== About 4 in a Row =====\nA strategic game where the first to align 4 blocks in a row wins!")
        input("\nPress Enter to return to the main menu.")

if __name__ == "__main__":
    FiveInARowClient().display_menu()
