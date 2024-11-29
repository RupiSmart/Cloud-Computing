const express = require('express');
const cors = require('cors');
const detectionRoutes = require('./routes/detect');
const helpRoutes = require('./routes/help');
const { router: historyRoutes } = require('./routes/history');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/detect', detectionRoutes);
app.use('/api/help', helpRoutes);
app.use('/api/history', historyRoutes);
app.use('api/delete', historyRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;