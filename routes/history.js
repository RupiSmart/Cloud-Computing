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

// Delete specific history
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;

        if (histories.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Riwayat deteksi kosong'
            });
        }

        const index = histories.findIndex(h => h.id === id);
        
        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: 'History dengan ID tersebut tidak ditemukan'
            });
        }

        histories.splice(index, 1);

        res.json({
            success: true,
            message: 'History berhasil dihapus',
            remainingCount: histories.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Clear all history
router.delete('/', (req, res) => {
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