const express = require('express');
const router = express.Router();

// Shared histories array
const histories = [];

// Get all history
router.get('/', (req, res) => {
    try {
        if (histories.length === 0) {
            return res.json({
                success: true,
                message: "Belum ada riwayat deteksi",
                history: []
            });
        }

        res.json({
            success: true,
            history: histories
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add history (Dipanggil oleh Flask API)
router.post('/', (req, res) => {
    try {
        const newHistory = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            ...req.body
        };

        histories.push(newHistory);

        res.json({
            success: true,
            history: newHistory
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Clear all history
router.delete('/clear', (req, res) => {
    try {
        if (histories.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Riwayat deteksi sudah kosong'
            });
        }

        const previousCount = histories.length;
        histories.length = 0; // Clear array
        
        res.json({
            success: true,
            message: `${previousCount} riwayat deteksi berhasil dihapus`,
            deletedCount: previousCount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export router dan histories array
module.exports = { router, histories };
