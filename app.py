"""Flask app serving the breast cancer prediction UI.

Run:  python app.py   then open http://127.0.0.1:5000
"""
import json
from pathlib import Path

import joblib
import numpy as np
from flask import Flask, jsonify, render_template, request

BASE = Path(__file__).parent
bundle = joblib.load(BASE / "model" / "model.joblib")
model, scaler = bundle["model"], bundle["scaler"]
meta = json.loads((BASE / "model" / "meta.json").read_text())
N_FEATURES = len(meta["features"])

app = Flask(__name__)


@app.get("/")
def index():
    return render_template("index.html")


@app.get("/api/meta")
def get_meta():
    return jsonify(meta)


@app.post("/api/predict")
def predict():
    payload = request.get_json(silent=True) or {}
    values = payload.get("values")
    if not isinstance(values, list) or len(values) != N_FEATURES:
        return jsonify(error=f"Expected {N_FEATURES} numbers, got "
                             f"{len(values) if isinstance(values, list) else 0}."), 400
    try:
        x = np.asarray(values, dtype=float).reshape(1, -1)
    except (TypeError, ValueError):
        return jsonify(error="All values must be numbers."), 400
    if not np.isfinite(x).all():
        return jsonify(error="All values must be finite numbers."), 400

    # Same steps as your notebook: standardize -> predict -> argmax
    proba = model.predict_proba(scaler.transform(x))[0]
    label = int(np.argmax(proba))  # 0 = Malignant, 1 = Benign
    return jsonify(
        label=label,
        diagnosis="Benign" if label == 1 else "Malignant",
        malignant_probability=float(proba[0]),
        benign_probability=float(proba[1]),
    )


if __name__ == "__main__":
    app.run(debug=True)
