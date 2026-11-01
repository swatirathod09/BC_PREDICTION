"""Train the breast cancer classifier from data.csv and save it to model/.

Run:  python train.py
Label convention (same as your notebook): 0 = Malignant, 1 = Benign.
"""
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score

df = pd.read_csv("data.csv")
df = df.drop(columns=[c for c in df.columns if c == "id" or c.startswith("Unnamed")])

X = df.drop(columns="diagnosis")
COLS = list(X.columns)
y = (df["diagnosis"] == "B").astype(int)  # M -> 0, B -> 1

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=2
)

X_train, X_test = X_train.values, X_test.values  # plain arrays, like the notebook
scaler = StandardScaler().fit(X_train)
model = MLPClassifier(
    hidden_layer_sizes=(32, 16), alpha=1e-3, max_iter=2000, random_state=2
).fit(scaler.transform(X_train), y_train)

acc_train = accuracy_score(y_train, model.predict(scaler.transform(X_train)))
acc_test = accuracy_score(y_test, model.predict(scaler.transform(X_test)))
print(f"train accuracy: {acc_train:.3f}   test accuracy: {acc_test:.3f}")

# Reference ranges + two sample rows, used by the UI
meta = {
    "features": COLS,
    "min": X.min().round(6).tolist(),
    "max": X.max().round(6).tolist(),
    "median": X.median().round(6).tolist(),
    "test_accuracy": round(float(acc_test), 4),
    "n_samples": int(len(df)),
    "samples": {
        "malignant": X[y == 0].iloc[0].round(6).tolist(),
        "benign": X[y == 1].iloc[0].round(6).tolist(),
    },
}
joblib.dump({"model": model, "scaler": scaler}, "model/model.joblib")
json.dump(meta, open("model/meta.json", "w"))
print("saved model/model.joblib and model/meta.json")
