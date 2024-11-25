import requests
import time
import os

API_BASE_URL = "https://five-in-a-row-ahwe.onrender.com/api"

class FiveInARowClient:
    def __init__(self):
        self.user_id = None
        self.nickname = None
        self.lobby_id = None

    def clear_console(self):
        os.system('cls' if os.name == 'nt' else 'clear')

    def display_menu(self):
        while True:
            self.clear_console()
            print("===== 5 in a Row =====")
            print("1. Play")
            print("2. About")
            print("3. Exit")
            choice = input("\nSelect an option (1/2/3): ").strip()

            if choice == "1":
                self.play_menu()
            elif choice == "2":
                self.display_about()
            elif choice == "3":
                print("Exiting... Goodbye!")
                break
            else:
                print("Invalid choice. Please try again.")
                time.sleep(2)

    def play_menu(self):
        while True:
            self.clear_console()
            print("===== Play 5 in a Row =====")
            print("1. Create a Lobby")
            print("2. Join a Lobby")
            print("3. Back to Main Menu")
            choice = input("\nSelect an option (1/2/3): ").strip()

            if choice == "1":
                self.create_lobby()
            elif choice == "2":
                self.join_lobby()
            elif choice == "3":
                return
            else:
                print("Invalid choice. Please try again.")
                time.sleep(2)

    def create_lobby(self):
        self.clear_console()
        print("===== Create a Lobby =====")
        self.nickname = input("Enter your nickname: ").strip()

        if not self.nickname:
            print("Nickname is required to create a lobby.")
            time.sleep(2)
            return

        self.user_id = self.generate_user_id()

        payload = {"userId": self.user_id, "nickname": self.nickname}
        response = requests.post(f"{API_BASE_URL}/create-lobby", json=payload)

        if response.status_code == 200:
            data = response.json()
            self.lobby_id = data["lobbyId"]
            print(f"\nLobby created! Share this ID with your friend: {self.lobby_id}")
            print("Waiting for another player to join...")
            self.wait_for_game_start()
        else:
            print("Failed to create a lobby. Please try again.")
            print(f"Error: {response.status_code} - {response.json()}")
            time.sleep(2)

    def join_lobby(self):
        self.clear_console()
        print("===== Join a Lobby =====")
        self.lobby_id = input("Enter the Lobby ID: ").strip()
        self.nickname = input("Enter your nickname: ").strip()

        if not self.lobby_id or not self.nickname:
            print("Both Lobby ID and Nickname are required to join a lobby.")
            time.sleep(2)
            return

        self.user_id = self.generate_user_id()

        payload = {"lobby": self.lobby_id, "userId": self.user_id, "nickname": self.nickname}
        response = requests.post(f"{API_BASE_URL}/join-lobby", json=payload)

        if response.status_code == 200:
            print("\nSuccessfully joined the lobby!")
            self.start_game()
        else:
            print("Failed to join the lobby. Please try again.")
            print(f"Error: {response.status_code} - {response.json()}")
            time.sleep(2)

    def wait_for_game_start(self):
        while True:
            game_state = self.fetch_game_state()
            if len(game_state["players"]) == 2:
                print("\nThe game is starting!")
                self.start_game()
                break
            else:
                print("Waiting for another player to join...")
                time.sleep(3)

    def start_game(self):
        print("\nGame started!")
        while True:
            game_state = self.fetch_game_state()

            # Check if game is over
            if game_state.get("gameOver"):
                print(f"\nGame Over: {game_state['winner']} wins!")
                break

            if game_state["currentPlayer"] == self.user_id:
                print("\nIt's your turn!")
                self.display_board(game_state["board"])
                self.make_move(game_state["board"])
            else:
                print(f"\nWaiting for {game_state['players'][game_state['currentPlayer']]} to play...")
                time.sleep(3)

    def make_move(self, board):
        best_move = self.find_best_move(board)
        if best_move is not None:
            print(f"\nMaking strategic move in column: {best_move}")
            payload = {"lobby": self.lobby_id, "userId": self.user_id, "cell": best_move}
            response = requests.post(f"{API_BASE_URL}/make-a-move", json=payload)

            if response.status_code == 200:
                print("Move successful!")
            else:
                error = response.json().get("error", "Unknown error")
                print(f"Move failed: {error}")
        else:
            print("No valid moves available.")

    def find_best_move(self, board):
        # Simple strategy: Find the first empty column
        for col in range(len(board[0])):
            if board[0][col] == " ":
                return col
        return None

    def fetch_game_state(self):
        response = requests.get(f"{API_BASE_URL}/game-state/{self.lobby_id}")
        if response.status_code == 200:
            return response.json()
        else:
            print("Failed to fetch game state.")
            return {}

    def display_board(self, board):
        print("\nCurrent Board:")
        for row in board:
            print(" | ".join(cell if cell != " " else "." for cell in row))
        print("-" * 29)

    @staticmethod
    def generate_user_id():
        import random, string
        return "".join(random.choices(string.ascii_lowercase + string.digits, k=8))


if __name__ == "__main__":
    client = FiveInARowClient()
    client.display_menu()
