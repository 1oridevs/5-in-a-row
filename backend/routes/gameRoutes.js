const express = require('express');
const {
    createLobby,
    joinLobby,
    makeMove,
    checkTimer,
    getGameState,
    joinAsSpectator
} = require('../controllers/gameController');

const router = express.Router();

router.post('/create-lobby', createLobby);
router.post('/join-lobby', joinLobby);
router.post('/make-a-move', makeMove);
router.get('/check-timer/:lobby', checkTimer);
router.get('/game-state/:lobby', getGameState);
router.post('/add-spectator', joinAsSpectator);

module.exports = router;
