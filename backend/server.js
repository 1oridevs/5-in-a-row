const express = require('express');
const cors = require('cors');
const gameRoutes = require('./routes/gameRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', gameRoutes);

app.use(express.static('public')); // Serve static files

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

