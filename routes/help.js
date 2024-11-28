const express = require('express');
const router = express.Router();

const helpTexts = {
    welcome: {
        title: "Selamat Datang di RupiSmart",
        text: "RupiSmart adalah aplikasi yang membantu Anda mendeteksi nominal uang Rupiah."
    },
    camera: {
        title: "Panduan Kamera",
        text: "Posisikan uang di tengah layar. Pastikan pencahayaan cukup."
    },
    position: {
        title: "Posisi Uang",
        text: "Jarak ideal kamera dengan uang adalah 15-20 cm."
    },
    history: {
        title: "Riwayat Deteksi",
        text: "Lihat hasil deteksi sebelumnya di menu riwayat."
    }
};

// Get semua kategori bantuan
router.get('/', (req, res) => {
    try {
        const categories = Object.keys(helpTexts).map(key => ({
            id: key,
            ...helpTexts[key]
        }));

        res.json({
            success: true,
            categories
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get bantuan spesifik
router.get('/:category', (req, res) => {
    try {
        const { category } = req.params;
        const helpContent = helpTexts[category];

        if (!helpContent) {
            return res.status(404).json({
                success: false,
                message: 'Kategori bantuan tidak ditemukan'
            });
        }

        res.json({
            success: true,
            help: helpContent
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;