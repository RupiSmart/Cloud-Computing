const express = require('express');
const cors = require('cors');
const helpRoutes = require('./routes/help');
const { router: historyRoutes } = require('./routes/history');

const app = express();

app.use(cors());
app.use(express.json());

// Routes - hanya help dan history
app.use('/api/help', helpRoutes);
app.use('/api/history', historyRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;