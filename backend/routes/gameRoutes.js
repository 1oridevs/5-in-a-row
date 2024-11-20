const express = require('express');
const { createLobby, joinLobby, makeMove, getGameState } = require('../controllers/gameController');
const router = express.Router();

router.post('/create-lobby', createLobby);
router.post('/join-lobby', joinLobby);
router.post('/make-a-move', makeMove);
router.get('/game-state/:lobby', getGameState);

module.exports = router;
