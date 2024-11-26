let lobbies = {};

// Define all functions

// Create a new lobby and add the creator as the first player
exports.createLobby = (req, res) => {
    const { userId, nickname } = req.body;

    if (!userId || !nickname) {
        return res.status(400).json({ error: "User ID and nickname are required to create a lobby." });
    }

    const lobbyId = Math.floor(100000 + Math.random() * 900000).toString();
    lobbies[lobbyId] = {
        board: Array(6).fill().map(() => Array(7).fill(" ")),
        players: { [userId]: nickname },
        currentPlayer: userId,
        moveDeadline: Date.now() + 30000, // 30 seconds for the first move
        gameOver: false,
        winMessage: null,
    };
    
    

    console.log(`Lobby created with ID: ${lobbyId}`);
    console.log(`Player joined: Lobby ID: ${lobbyId}, User ID: ${userId}, Nickname: ${nickname}`);
    console.log(`Current number of users in lobby ${lobbyId}: ${Object.keys(lobbies[lobbyId].players).length}`);

    res.json({ lobbyId });
};

// Join an existing lobby
exports.joinLobby = (req, res) => {
    const { lobby, userId, nickname } = req.body;

    // Check if the lobby exists
    const game = lobbies[lobby];
    if (!game) {
        return res.status(404).json({ error: "Lobby not found" });
    }

    // Check if the lobby is full
    if (Object.keys(game.players).length >= 2) {
        return res.status(400).json({ error: "Lobby is full" });
    }

    // Add the player to the lobby and log the information
    game.players[userId] = nickname;
    console.log(`Player joined: Lobby ID: ${lobby}, User ID: ${userId}, Nickname: ${nickname}`);
    
    // Log the current number of users in the lobby
    console.log(`Current number of users in lobby ${lobby}: ${Object.keys(game.players).length}`);

    // Set the first player as the current player if not already set
    if (!game.currentPlayer) {
        game.currentPlayer = userId;
    }

    res.json({ message: "Joined lobby", lobbyId: lobby });
};


// 3. Make a Move
// Helper function to check for a win
function checkWin(board, userId) {
    const height = board.length;
    const width = board[0].length;
    const target = 4;

    // Helper function to check a line of cells
    const checkLine = (line) => {
        let count = 0;
        for (const cell of line) {
            if (cell === userId) {
                count += 1;
                if (count === target) return true;
            } else {
                count = 0;
            }
        }
        return false;
    };

    // Check horizontal, vertical, and diagonal lines for a win
    for (let row = 0; row < height; row++) {
        if (checkLine(board[row])) return true;
    }

    for (let col = 0; col < width; col++) {
        const column = board.map(row => row[col]);
        if (checkLine(column)) return true;
    }

    for (let row = 0; row < height - target + 1; row++) {
        for (let col = 0; col < width - target + 1; col++) {
            const diagonal1 = [];
            const diagonal2 = [];
            for (let i = 0; i < target; i++) {
                diagonal1.push(board[row + i][col + i]);
                diagonal2.push(board[row + i][col + target - 1 - i]);
            }
            if (checkLine(diagonal1) || checkLine(diagonal2)) return true;
        }
    }

    return false;
}

exports.makeMove = (req, res) => {
    const { lobby, userId, cell } = req.body;
    const game = lobbies[lobby];

    if (!game) return res.status(404).json({ error: "Lobby not found" });

    // Prevent moves if the game is over
    if (game.gameOver) {
        return res.status(400).json({ error: "Game is over. Please start a new game." });
    }
    if (Date.now() > game.moveDeadline) {
        game.gameOver = true;
        const winnerId = Object.keys(game.players).find(p => p !== userId); // Opponent wins
        game.winMessage = `${game.players[winnerId]} wins! (Time out)`;
        return res.status(400).json({ error: "Time out! Game over.", board: game.board, message: game.winMessage });
    }
    
    if (game.currentPlayer !== userId) {
        return res.status(403).json({ error: "Not your turn" });
    }

    const board = game.board;
    const column = cell;

    // Check if the column is full
    if (board[0][column] !== " ") {
        return res.status(400).json({ error: "Column is full" });
    }

    // Drop the disk in the specified column
    for (let row = board.length - 1; row >= 0; row--) {
        if (board[row][column] === " ") {
            board[row][column] = userId;
            break;
        }
    }

    // Check for a win
    if (checkWin(board, userId)) {
        const winnerName = game.players[userId];
        game.gameOver = true;
        game.winMessage = `${winnerName} wins!`; // Persist win message for all players
        console.log(`Player ${winnerName} has won the game!`);
    }

    // Switch turns if no win is detected
    if (!game.gameOver) {
        game.currentPlayer = Object.keys(game.players).find(p => p !== userId);
        game.moveDeadline = Date.now() + 30000;
    }

    res.json({
        board: game.board,
        currentPlayer: game.currentPlayer,
        message: game.winMessage || null,
        moveDeadline: game.moveDeadline
    });
};


exports.getGameState = (req, res) => {
    const { lobby } = req.params;
    const game = lobbies[lobby];
    if (!game) return res.status(404).json({ error: "Lobby not found" });

    res.json({
        board: game.board,
        currentPlayer: game.currentPlayer,
        players: game.players,
        gameOver: game.gameOver || false,
        winner: game.winner || null, // Add winner info if game is over
        timestamp: Date.now(), // Add timestamp for state updates
    });
};

exports.checkTimer = (req, res) => {
    const { lobby } = req.params;
    const game = lobbies[lobby];

    if (!game) return res.status(404).json({ error: "Lobby not found" });

    if (Date.now() > game.moveDeadline && !game.gameOver) {
        // Switch the turn if the timer expires
        game.currentPlayer = Object.keys(game.players).find(p => p !== game.currentPlayer);
        game.moveDeadline = Date.now() + 30000; // Reset timer
    }

    res.json({
        board: game.board,
        currentPlayer: game.currentPlayer,
        moveDeadline: game.moveDeadline,
        gameOver: game.gameOver,
        message: game.winMessage || null,
    });
};


exports.addSpectator = (req, res) => {
    const { lobby, userId, nickname } = req.body;

    const game = lobbies[lobby];
    if (!game) return res.status(404).json({ error: "Lobby not found" });

    if (!game.spectators) game.spectators = {};

    game.spectators[userId] = nickname;
    console.log(`Spectator joined: Lobby ID: ${lobby}, User ID: ${userId}, Nickname: ${nickname}`);
    
    res.json({ message: "Joined as a spectator", lobbyId: lobby });
};

exports.getGameState = (req, res) => {
    const { lobby } = req.params;
    const game = lobbies[lobby];
    if (!game) return res.status(404).json({ error: "Lobby not found" });

    res.json({
        board: game.board,
        currentPlayer: game.currentPlayer,
        players: game.players,
        spectators: game.spectators || {}, // Include spectators
        gameOver: game.gameOver || false,
        winner: game.winner || null,
        timestamp: Date.now(),
    });
};
