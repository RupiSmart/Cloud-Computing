from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os
from datetime import datetime
import pytz
from google.cloud import firestore
from google.cloud import storage
import uuid

app = Flask(__name__)

# Initialize Firestore dan Storage
db = firestore.Client()
storage_client = storage.Client()
# Definisikan nama bucket dan inisialisasi
BUCKET_NAME = 'rupismart-predictions'  
bucket = storage_client.bucket(BUCKET_NAME)

# Load model
model = tf.keras.models.load_model('./model/model_denomination.h5')

# Label sesuai urutan dari training
nominal_labels = [
    '1000COIN', '100COIN', '100RIBU', '10RIBU', '1RIBU', 
    '200COIN', '20RIBU', '2RIBU', '500COIN', '50RIBU', 
    '5RIBU', '75RIBU'
]

# Pre-processing sesuai dengan training
def preprocess_image(image):
    image = image.resize((120, 120))
    img_array = tf.keras.preprocessing.image.img_to_array(image)
    img_array = tf.expand_dims(img_array, axis=0)
    return img_array

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'image' not in request.files:
            return jsonify({
                "success": False,
                "error": "No image file provided" 
            }), 400

        jakarta_tz = pytz.timezone('Asia/Jakarta')
        timestamp = datetime.now(jakarta_tz)
        prediction_id = str(uuid.uuid4())

        image_file = request.files['image']
        image = Image.open(image_file)

        # Save original image to Cloud Storage
        blob_name = f"predictions/{prediction_id}.jpg"
        blob = bucket.blob(blob_name)
        image_file.seek(0)
        blob.upload_from_file(image_file)
        image_url = f"https://storage.googleapis.com/{BUCKET_NAME}/{blob_name}"

        # Convert ke RGB
        image = image.convert('RGB')
        
        # Get prediction
        processed_image = preprocess_image(image)
        predictions = model.predict(processed_image)

        # Check if predictions are too low (likely not money)
        max_confidence = float(np.max(predictions[0]))
        if max_confidence < 0.5:  # Threshold 50%
            return jsonify({
                "success": False,
                "error": "Gambar tidak dikenali sebagai uang.",
                "debug": {
                    "confidence": max_confidence,
                    "predictions": predictions[0].tolist()
                }
            }), 400
        
        # Get predicted class
        predicted_class_index = np.argmax(predictions[0])
        predicted_class_name = nominal_labels[predicted_class_index]
        confidence = float(predictions[0][predicted_class_index])

        # Format deskriptif output nominal
        def format_nominal(nominal):
            if "COIN" in nominal:
                value = nominal.replace("COIN", "")
                if value == "1000":
                    return f"Seribu Rupiah Koin"
                elif value == "500":
                    return f"500 Rupiah Koin"
                elif value == "200":
                    return f"200 Rupiah Koin"
                elif value == "100":
                    return f"Seratus Rupiah Koin"
            else:
                value = nominal.replace("RIBU", "")
                if value == "100":
                    return "Seratus Ribu Rupiah"
                elif value == "75":
                    return "Tujuh Puluh Lima Ribu Rupiah"
                elif value == "50":
                    return "Lima Puluh Ribu Rupiah"
                elif value == "20":
                    return "Dua Puluh Ribu Rupiah"
                elif value == "10":
                    return "Sepuluh Ribu Rupiah"
                elif value == "5":
                    return "Lima Ribu Rupiah"
                elif value == "2":
                    return "Dua Ribu Rupiah"
                elif value == "1":
                    return "Seribu Rupiah"
            return nominal

        prediction_data = {
            "prediction_id": prediction_id,
            "timestamp": timestamp,
            "nominal": predicted_class_name,
            "nominal_text": format_nominal(predicted_class_name),
            "confidence": confidence,
            "type": "Koin" if "COIN" in predicted_class_name else "Uang Kertas",
            "image_url": image_url
        }

        # Save to Firestore
        db.collection('predictions').document(prediction_id).set(prediction_data)

        return jsonify({
            "success": True,
            "result": {
                "nominal": predicted_class_name,
                "nominal_text": format_nominal(predicted_class_name),
                "confidence": confidence,
                "type": "Koin" if "COIN" in predicted_class_name else "Uang Kertas",
                "prediction_time": {
                    "date": timestamp.strftime("%Y-%m-%d"),
                    "time": timestamp.strftime("%H:%M:%S"),
                    "timezone": "Asia/Jakarta"
                },
                "image_url": image_url
            },
            "debug": {
                "predictions": predictions[0].tolist(),
                "predicted_index": int(predicted_class_index)
            }
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    print("Model loaded successfully")
    app.run(host='0.0.0.0', port=8000)