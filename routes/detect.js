const express = require('express');
const router = express.Router();
const MoneyClassifier = require('../models/moneyClassifier');
let { histories } = require('./history');

const classifier = new MoneyClassifier();

// Import histories dari history.js


// Format nominal ke teks
function formatNominalToText(nominal, isReal = true, isKoin = false) {
    let nominalText;
    switch (nominal) {
        case 100: nominalText = 'Seratus'; break;
        case 500: nominalText = 'Lima Ratus'; break;
        case 1000: nominalText = isKoin ? 'Seribu Koin' : 'Seribu'; break;
        case 2000: nominalText = 'Dua Ribu'; break;
        case 5000: nominalText = 'Lima Ribu'; break;
        case 10000: nominalText = 'Sepuluh Ribu'; break;
        case 20000: nominalText = 'Dua Puluh Ribu'; break;
        case 50000: nominalText = 'Lima Puluh Ribu'; break;
        case 100000: nominalText = 'Seratus Ribu'; break;
        default: nominalText = new Intl.NumberFormat('id-ID').format(nominal);
    }
    return `Ini adalah uang ${nominalText} Rupiah${isKoin ? ' koin' : ''}${isReal ? ' asli' : ' palsu'}`;
}

// Fungsi untuk menyimpan ke history
function saveToHistory(detectionResult) {
    const historyItem = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...detectionResult
    };
    histories.push(historyItem);
    return historyItem;
}

// Endpoint deteksi
router.post('/predict', async (req, res) => {
    try {
        // Check posisi
        const positionResult = classifier.checkPosition(req.body);
        if (!positionResult.isValid) {
            return res.json({
                success: false,
                message: 'Posisi uang kurang tepat',
                position: positionResult.position,
                suggestion: 'Mohon posisikan uang di tengah kamera'
            });
        }

        // Prediksi
        const result = await classifier.predict(req.body);
        const label = formatNominalToText(result.nominal, result.isReal, result.isKoin);

        // Simpan ke history
        const detectionResult = {
            ...result,
            label,
            position: positionResult.position
        };
        const historyItem = saveToHistory(detectionResult);

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            result: detectionResult,
            history: {
                id: historyItem.id,
                saved: true
            }
        });

    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

module.exports = router;