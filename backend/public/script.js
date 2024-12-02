const boardElement = document.getElementById('board');
const popup = document.getElementById('popup');
const lobbySection = document.getElementById('lobby-section');
const hostOptions = document.getElementById('host-options');
const joinOptions = document.getElementById('join-options');
const gameSection = document.getElementById('game-section');
const currentLobbySpan = document.getElementById('current-lobby');
const currentTurnSpan = document.getElementById('current-turn');
const API_BASE_URL = "https://five-in-a-row-ahwe.onrender.com";
let gameOver = false;
let gameId = null;
let userId = Math.random().toString(36).substring(2, 9);
let nickname = "";
let currentTurn = null;

// Add "Waiting for Opponent" popup
const waitingPopup = document.createElement("div");
waitingPopup.id = "waitingPopup";
waitingPopup.innerHTML = `
    <div class="modal-content">
        <h2 id="waitingMessage">Waiting for an opponent to join...</h2>
    </div>
`;
waitingPopup.style.display = "none";
document.body.appendChild(waitingPopup);

// Function to show the "Waiting for Opponent" popup
function showWaitingPopup() {
    waitingPopup.style.display = "flex";
}

// Function to hide the "Waiting for Opponent" popup
function hideWaitingPopup() {
    waitingPopup.style.display = "none";
}

// Function to handle the initial choice popup
function selectOption(option) {
    popup.style.display = 'none';
    lobbySection.style.display = 'block';

    if (option === 'host') {
        hostOptions.style.display = 'block';
    } else if (option === 'join') {
        joinOptions.style.display = 'block';
    }
}

async function createLobby() {
    userId = Math.random().toString(36).substring(2, 9); // Generate a unique user ID
    nickname = document.getElementById('hostNicknameInput').value; // Use the host nickname input

    if (!nickname) {
        alert("Please enter a nickname");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/create-lobby`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, nickname }) // Pass userId and nickname
        });

        const data = await response.json();
        gameId = data.lobbyId;
        alert(`Lobby created with ID: ${gameId}`);

        showWaitingPopup(); // Show the waiting popup
        waitForOpponent(); // Start polling for opponent

    } catch (error) {
        console.error("Error creating lobby:", error);
    }
}

async function joinLobby() {
    const lobbyId = document.getElementById('lobbyIdInput').value; // Get the lobby ID
    nickname = document.getElementById('joinNicknameInput').value; // Get the nickname

    if (!lobbyId || !nickname) {
        alert("Please enter a lobby ID and nickname");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/join-lobby`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lobby: lobbyId, userId, nickname })
        });

        const data = await response.json();

        if (data.error) {
            alert(data.error); // Show error if lobby join fails
        } else {
            gameId = lobbyId;
            showGameSection();
        }
    } catch (error) {
        console.error("Error joining lobby:", error);
    }
}

function showGameSection() {
    hideWaitingPopup(); // Hide the waiting popup
    lobbySection.style.display = 'none';
    gameSection.style.display = 'block';
    currentLobbySpan.textContent = gameId;

    renderBoard(Array(15).fill().map(() => Array(15).fill(" ")), { players: {} });
    pollBoardState();
}

// Poll for an opponent to join
async function waitForOpponent() {
    const interval = setInterval(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/game-state/${gameId}`);
            const data = await response.json();

            if (Object.keys(data.players || {}).length === 2) {
                clearInterval(interval); // Stop polling
                showGameSection(); // Show the main game section
            }
        } catch (error) {
            console.error("Error polling for opponent:", error);
        }
    }, 2000); // Poll every 2 seconds
}

async function makeMove(column) {
    if (gameOver) {
        alert("The game is already over!");
        return;
    }

    if (userId !== currentTurn) {
        alert("It's not your turn!");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/make-a-move`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lobby: gameId, userId, cell: column }),
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error);
            return;
        }

        if (data.board) {
            renderBoard(data.board, data);
        }

        if (data.message) {
            gameOver = true;
            showWinnerPopup(data.message);
        }
    } catch (error) {
        console.error("Error making move:", error);
    }
}

// Render the game board
function renderBoard(board, data) {
    boardElement.innerHTML = '';
    const playerList = document.getElementById('player-list');
    playerList.innerHTML = ''; // Clear existing players

    const players = data.players || {};

    boardElement.style.gridTemplateColumns = `repeat(15, 40px)`;
    boardElement.style.gridTemplateRows = `repeat(15, 40px)`;

    board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell';

            if (cell !== " ") {
                cellDiv.style.backgroundColor = getPlayerColor(cell);
                cellDiv.textContent = players[cell] || cell;
            } else {
                cellDiv.textContent = "";
            }

            cellDiv.onclick = () => makeMove(colIndex);
            boardElement.appendChild(cellDiv);
        });
    });

    for (const [userId, nickname] of Object.entries(players)) {
        const playerItem = document.createElement('li');
        playerItem.textContent = nickname;
        playerList.appendChild(playerItem);
    }
}


function closeModal() {
    const modal = document.getElementById('winnerModal');
    modal.style.display = 'none';
}

async function fetchBoardState() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/game-state/${gameId}`);
        const data = await response.json();

        console.log('Game state data:', data); // Debugging statement

        if (data.board) {
            renderBoard(data.board, data); // Render the updated board
        }

        if (data.gameOver && data.winner) {
            gameOver = true; // Stop further updates
            const winnerName = data.players[data.winner] || "Unknown";
            showWinnerPopup(`Winner: ${winnerName}`);
            return; // Exit early since game is over
        }

        // Update the current turn
        if (data.currentPlayer && data.players) {
            currentTurn = data.currentPlayer;
            currentTurnSpan.textContent = data.players[data.currentPlayer] || "Waiting...";
        }

        // Update the timer
        if (data.moveDeadline) {
            const timerElement = document.getElementById('timer');
            const timeRemaining = Math.max(0, Math.floor((data.moveDeadline - Date.now()) / 1000));
            timerElement.textContent = `${timeRemaining}s`;
        }
    } catch (error) {
        console.error("Error fetching game state:", error);
    }
}

function showWinnerPopup(message) {
    if (!message) return; // Do not show the popup if there is no message

    const modal = document.getElementById('winnerModal');
    const winnerMessage = document.getElementById('winnerMessage');

    winnerMessage.textContent = message;
    modal.style.display = 'block';
}


function pollBoardState() {
    const interval = setInterval(() => {
        if (gameOver) {
            clearInterval(interval);
        } else {
            fetchBoardState();
        }
    }, 1000);
}
