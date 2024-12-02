let lobbies = {};

// Create a new lobby
exports.createLobby = (req, res) => {
    const { userId, nickname } = req.body;

    if (!userId || !nickname) {
        return res.status(400).json({ error: "User ID and nickname are required to create a lobby." });
    }

    const lobbyId = Math.floor(100000 + Math.random() * 900000).toString();
    lobbies[lobbyId] = {
        board: Array(15).fill().map(() => Array(15).fill(" ")),
        players: { [userId]: nickname },
        spectators: {}, // Initialize spectators as an object
        currentPlayer: null, // Game starts only when a second player joins
        moveDeadline: null, // No move deadline until the game starts
        gameOver: false,
        winMessage: null,
    };

    console.log(`Lobby created with ID: ${lobbyId}`);
    res.json({ lobbyId });
};

// Join an existing lobby
exports.joinLobby = (req, res) => {
    const { lobby, userId, nickname } = req.body;

    const game = lobbies[lobby];
    if (!game) {
        return res.status(404).json({ error: "Lobby not found" });
    }

    if (game.gameOver) {
        return res.status(400).json({ error: "Cannot join. The game is already over." });
    }

    if (Object.keys(game.players).length < 2) {
        game.players[userId] = nickname;

        // Start the game when the second player joins
        if (Object.keys(game.players).length === 2) {
            game.currentPlayer = Object.keys(game.players)[0]; // Set the first player as current
            game.moveDeadline = Date.now() + 30000; // Start 30-second timer
            console.log("Game started!");
        }

        console.log(`Player joined: Lobby ID: ${lobby}, User ID: ${userId}, Nickname: ${nickname}`);
        return res.json({ message: "Joined as player", lobbyId: lobby });
    }

    // Add as a spectator
    game.spectators[userId] = nickname;
    console.log(`Spectator joined: Lobby ID: ${lobby}, User ID: ${userId}, Nickname: ${nickname}`);
    return res.json({ message: "Joined as spectator", lobbyId: lobby });
};



// Make a move
exports.makeMove = (req, res) => {
    const { lobby, userId, cell } = req.body;
    const game = lobbies[lobby];

    if (!game) return res.status(404).json({ error: "Lobby not found" });

    if (game.gameOver) {
        return res.status(400).json({ error: "Game is over. No moves allowed." });
    }

    if (!game.players[userId]) {
        return res.status(403).json({ error: "You are a spectator. You cannot make a move." });
    }

    if (game.currentPlayer !== userId) {
        return res.status(403).json({ error: "It's not your turn!" });
    }

    const board = game.board;
    const column = cell;

    if (board[0][column] !== " ") {
        return res.status(400).json({ error: "Column is full" });
    }

    for (let row = board.length - 1; row >= 0; row--) {
        if (board[row][column] === " ") {
            board[row][column] = userId;
            break;
        }
    }

    if (checkWin(board, userId)) {
        game.gameOver = true;
        game.winMessage = `${game.players[userId]} wins!`;
        console.log(game.winMessage);
    } else {
        game.currentPlayer = Object.keys(game.players).find(p => p !== userId);
        game.moveDeadline = Date.now() + 30000;
    }

    res.json({
        board: game.board,
        currentPlayer: game.currentPlayer,
        message: game.winMessage || null,
        moveDeadline: game.moveDeadline,
    });
};


// Check timer
exports.checkTimer = (req, res) => {
    const { lobby } = req.params;
    const game = lobbies[lobby];

    if (!game) return res.status(404).json({ error: "Lobby not found" });

    if (game.gameOver) {
        return res.json({ message: game.winMessage });
    }

    if (Date.now() > game.moveDeadline) {
        game.currentPlayer = Object.keys(game.players).find(p => p !== game.currentPlayer);
        game.moveDeadline = Date.now() + 30000;
        console.log(`Turn switched due to timeout.`);
    }

    res.json({
        board: game.board,
        currentPlayer: game.currentPlayer,
        moveDeadline: game.moveDeadline,
    });
};

// Utility to check win
function checkWin(board, userId) {
    const height = board.length;
    const width = board[0].length;
    const target = 4;

    const checkLine = (line) => {
        let count = 0;
        for (const cell of line) {
            count = cell === userId ? count + 1 : 0;
            if (count === target) return true;
        }
        return false;
    };

    for (let row = 0; row < height; row++) if (checkLine(board[row])) return true;
    for (let col = 0; col < width; col++) if (checkLine(board.map(row => row[col]))) return true;

    for (let row = 0; row < height - target + 1; row++) {
        for (let col = 0; col < width - target + 1; col++) {
            const diagonal1 = [], diagonal2 = [];
            for (let i = 0; i < target; i++) {
                diagonal1.push(board[row + i][col + i]);
                diagonal2.push(board[row + i][col + target - 1 - i]);
            }
            if (checkLine(diagonal1) || checkLine(diagonal2)) return true;
        }
    }

    return false;
}

exports.getGameState = (req, res) => {
    const { lobby } = req.params;
    const game = lobbies[lobby];

    if (!game) {
        return res.status(404).json({ error: "Lobby not found" });
    }

    res.json({
        board: game.board,
        currentPlayer: game.currentPlayer,
        players: game.players,
        spectators: game.spectators || {}, // Include spectators in the state
        gameOver: game.gameOver || false,
        winner: game.winner || null,
        moveDeadline: game.gameOver ? null : game.moveDeadline || Date.now(),
        });
};

// Join as a spectator
exports.joinAsSpectator = (req, res) => {
    const { lobby, userId, nickname } = req.body;

    const game = lobbies[lobby];
    if (!game) {
        return res.status(404).json({ error: "Lobby not found" });
    }

    if (game.gameOver) {
        return res.status(400).json({ error: "Cannot spectate. The game is already over." });
    }

    // Check if the user is already a player
    if (game.players[userId]) {
        return res.status(400).json({ error: "You are already a player in this game." });
    }

    // Add user as a spectator
    game.spectators[userId] = nickname;
    console.log(`Spectator joined: Lobby ID: ${lobby}, User ID: ${userId}, Nickname: ${nickname}`);

    return res.json({ message: "Joined as spectator", lobbyId: lobby });
};



