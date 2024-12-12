const express = require('express');
const router = express.Router();

const helpTexts = {
    id: {  // Indonesian
        welcome: {
            title: "Selamat datang di RupiSmart.",
            text: "RupiSmart adalah aplikasi yang membantu Anda mendeteksi nominal mata uang Rupiah."
        },
        camera: {
            title: "Panduan Kamera.",
            text: "Posisikan uang di tengah layar. Pastikan pencahayaan cukup."
        },
        position: {
            title: "Posisi Uang.",
            text: "Jarak ideal antara kamera dan uang adalah 15-20 cm."
        },
        history: {
            title: "Riwayat Deteksi.",
            text: "Lihat hasil deteksi sebelumnya di menu riwayat."
        }
    },
    en: {  // English
        welcome: {
            title: "Welcome to RupiSmart.",
            text: "RupiSmart is an application that helps you detect nominal Rupiah currency."
        },
        camera: {
            title: "Camera Guide.",
            text: "Position the money in the center of the screen. Make sure the lighting is sufficient."
        },
        position: {
            title: "Money Position.",
            text: "The ideal distance between the camera and the money is 15-20 cm."
        },
        history: {
            title: "Detection History.",
            text: "View previous detection results in the history menu."
        }
    }
};

// Get semua kategori bantuan dengan parameter bahasa
router.get('/', (req, res) => {
    try {
        // Default ke bahasa Indonesia jika tidak ada parameter
        const lang = req.query.lang || 'id';
        
        // Validasi bahasa yang didukung
        if (!helpTexts[lang]) {
            return res.status(400).json({
                success: false,
                error: "Unsupported language"
            });
        }

        const categories = Object.keys(helpTexts[lang]).map(key => ({
            id: key,
            ...helpTexts[lang][key]
        }));

        res.json({
            success: true,
            language: lang,
            categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
