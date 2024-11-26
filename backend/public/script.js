const boardElement = document.getElementById('board');
const popup = document.getElementById('popup');
const lobbySection = document.getElementById('lobby-section');
const hostOptions = document.getElementById('host-options');
const joinOptions = document.getElementById('join-options');
const gameSection = document.getElementById('game-section');
const currentLobbySpan = document.getElementById('current-lobby');
const currentTurnSpan = document.getElementById('current-turn'); // Add this line
const API_BASE_URL = "https://five-in-a-row-ahwe.onrender.com";
let gameOver = false;
let gameId = null;
let userId = Math.random().toString(36).substring(2, 9);
let nickname = "";
let currentTurn = null;
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
        showGameSection();
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
    lobbySection.style.display = 'none';
    gameSection.style.display = 'block';
    currentLobbySpan.textContent = gameId;

    // Pass an empty players object initially
    renderBoard(Array(6).fill().map(() => Array(7).fill(" ")), { players: {} });
    pollBoardState();
}


function test() {
    console.log("TEST")
}

function showWinnerPopup(message) {
    const modal = document.getElementById('winnerModal');
    const winnerMessage = document.getElementById('winnerMessage');

    winnerMessage.textContent = message;
    modal.style.display = 'block';
}


function closeModal() {
    const modal = document.getElementById('winnerModal');
    modal.style.display = 'none';
}

async function makeMove(column) {
    if (gameOver) {
        console.log("Game is already over!");
        return;
    }

    try {
        if (userId !== currentTurn) {
            alert("It's not your turn!");
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/make-a-move`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lobby: gameId, userId, cell: column })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(`Error making move: ${data.error}`);
            return;
        }

        if (data.board) {
            renderBoard(data.board, data);
        }

        // Show the winner popup if there's a win
        if (data.message) {
            console.log(`Frontend: ${data.message}`);
            showWinnerPopup(data.message);
            gameOver = true;
        }
    } catch (error) {
        console.error("Error making move:", error);
    }
}


function resetGame() {
    closeModal();
    window.location.reload(); // For now, just reload the page to reset
}


// Color dictionary for players
const playerColors = {};

// Function to assign a unique color to each player
function getPlayerColor(userId) {
    if (!playerColors[userId]) {
        // Assign a color based on the number of players
        const colors = ['#6a5acd', '#ffa07a', '#ff6347', '#3cb371']; // Add more colors if needed
        const colorIndex = Object.keys(playerColors).length % colors.length;
        playerColors[userId] = colors[colorIndex];
    }
    return playerColors[userId];
}

// Function to render the game board
function renderBoard(board, data) {
    boardElement.innerHTML = '';
    const playerList = document.getElementById('player-list');
    playerList.innerHTML = ''; // Clear existing players

    // Safely handle cases where data.players might be undefined
    const players = data.players || {};

    // Render the game board
    board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell';

            // Set the cell's background color and text based on the player
            if (cell !== " ") {
                cellDiv.style.backgroundColor = getPlayerColor(cell); // Get color for the userId
                cellDiv.textContent = players[cell] || cell; // Display the nickname if available
            } else {
                cellDiv.textContent = "";
            }

            cellDiv.onclick = () => makeMove(colIndex);
            boardElement.appendChild(cellDiv);
        });
    });

    // Update the player list in the sidebar
    for (const [userId, nickname] of Object.entries(players)) {
        const playerItem = document.createElement('li');
        playerItem.textContent = nickname;
        playerList.appendChild(playerItem);
    }
}


function pollBoardState() {
    setInterval(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/game-state/${gameId}`);
            const data = await response.json();

            if (data.board) {
                renderBoard(data.board, data);
            }

            // Update turn and timer display
            if (data.currentPlayer && data.players) {
                currentTurn = data.currentPlayer;
                currentTurnSpan.textContent = data.players[data.currentPlayer] || "Unknown";
            }

            if (data.moveDeadline) {
                const timerElement = document.getElementById('timer');
                const timeRemaining = Math.max(0, Math.floor((data.moveDeadline - Date.now()) / 1000));
                timerElement.textContent = `${timeRemaining}s`;

                // Alert for timer expiry
                if (timeRemaining === 0) {
                    alert("Time expired! Turn has been switched.");
                }
            }

            if (data.message && !gameOver) {
                gameOver = true;
                showWinnerPopup(data.message);
            }
        } catch (error) {
            console.error("Error fetching game state:", error);
        }
    }, 1000);
}








