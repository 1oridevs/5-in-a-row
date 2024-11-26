const express = require('express');
const { createLobby, joinLobby, makeMove, getGameState, checkTimer, addSpectator} = require('../controllers/gameController');
const router = express.Router();

router.post('/create-lobby', createLobby);
router.post('/join-lobby', joinLobby);
router.post('/make-a-move', makeMove);
router.get('/game-state/:lobby', getGameState);
router.get('/check-timer/:lobby', checkTimer);
router.post('/add-spectator', addSpectator);

module.exports = router;
