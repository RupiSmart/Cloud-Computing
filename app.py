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
BUCKET_NAME = 'rupismart-predictions'  
bucket = storage_client.bucket(BUCKET_NAME)

# Load model autentikasi
authenticity_model = tf.keras.models.load_model('./model/model_autenticity.h5')

def preprocess_image(image, target_size=(120, 120)):
    image = image.resize(target_size)
    img_array = tf.keras.preprocessing.image.img_to_array(image)
    img_array = tf.expand_dims(img_array, 0)
    return img_array

def check_authenticity(processed_image, confidence_threshold=0.5):  # Threshold diset 0.5
    predictions = authenticity_model.predict(processed_image)
    predicted_class = np.argmax(predictions, axis=1)[0]
    confidence = float(np.max(predictions))
    
    if confidence >= confidence_threshold:
        result = "Asli"
    else:
        result = "Palsu" if predicted_class == 0 else "Asli"

    return result, confidence

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

        # Preprocess image
        processed_image = preprocess_image(image)

        # Predict authenticity
        predictions = authenticity_model.predict(processed_image)
        predicted_class = np.argmax(predictions, axis=1)[0]
        confidence = float(np.max(predictions))
        
        # Check result with threshold
        if confidence >= 0.5:  # threshold 0.5
            auth_result = "Asli"
        else:
            auth_result = "Palsu" if predicted_class == 0 else "Asli"

        prediction_data = {
            "prediction_id": prediction_id,
            "timestamp": timestamp,
            "authenticity": auth_result,
            "auth_confidence": confidence,
            "image_url": image_url
        }

        # Save to Firestore
        db.collection('predictions').document(prediction_id).set(prediction_data)

        return jsonify({
            "success": True,
            "result": {
                "authenticity": auth_result,
                "confidence": confidence,
                "prediction_time": {
                    "date": timestamp.strftime("%Y-%m-%d"),
                    "time": timestamp.strftime("%H:%M:%S"),
                    "timezone": "Asia/Jakarta"
                },
                "image_url": image_url
            },
            "debug": {
                "raw_predictions": predictions[0].tolist(),
                "threshold": 0.5
            }
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    print("Authenticity Model loaded successfully")
    app.run(host='0.0.0.0', port=8000)