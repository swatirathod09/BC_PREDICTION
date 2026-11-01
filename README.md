# 🎗️ Breast Cancer Tumor Classifier

A machine learning-based web application that classifies breast tumors as **Malignant** or **Benign** using 30 cell-nucleus measurements from the **Wisconsin Diagnostic Breast Cancer (WDBC) Dataset**.

The application uses a neural network model to analyze input measurements and predict the tumor classification through a simple, user-friendly web interface.

## 🚀 Features

- Predicts whether a tumor is Malignant or Benign.
- Uses 30 cell-nucleus measurements for classification.
- Three input categories:
  - Mean
  - Standard Error
  - Worst
- Paste all 30 comma-separated values at once.
- Load sample data for Benign and Malignant predictions.
- Displays prediction results through a web interface.
- Includes a pre-trained machine learning model.
- Supports model retraining using the dataset.

## 🛠️ Technologies Used

- **Programming Language:** Python
- **Backend:** Flask
- **Machine Learning:** Scikit-learn (MLPClassifier)
- **Data Processing:** Pandas, NumPy
- **Frontend:** HTML, CSS, JavaScript
- **Dataset:** Wisconsin Diagnostic Breast Cancer Dataset

## 📂 Project Structure

```text
Breast-Cancer-Tumor-Classifier/
│
├── app.py
├── train.py
├── requirements.txt
├── data.csv
│
├── model/
│   └── Trained model files
│
├── templates/
│   └── index.html
│
└── static/
    ├── css/
    ├── js/
    └── images/
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone <your-github-repository-url>
```

### 2. Navigate to the Project Folder

```bash
cd Breast-Cancer-Tumor-Classifier
```

### 3. Create a Virtual Environment

```bash
python -m venv .venv
```

### 4. Activate the Virtual Environment

**Windows:**

```bash
.venv\Scripts\activate
```

**Mac/Linux:**

```bash
source .venv/bin/activate
```

### 5. Install Dependencies

```bash
pip install -r requirements.txt
```

### 6. Run the Application

```bash
python app.py
```

### 7. Open in Browser

Visit the following URL:

```text
http://127.0.0.1:5000
```

## 🧠 Model Training

A pre-trained model is already included in the `model/` directory.

To train the model again using `data.csv`, execute:

```bash
python train.py
```

The trained model will be saved in the `model/` directory.

## 📊 How to Use the Application

1. Open the application in your browser.
2. Enter the 30 cell-nucleus measurements across the three tabs:
   - Mean
   - Standard Error
   - Worst
3. Alternatively, paste all 30 comma-separated values into the input box.
4. Use the **Load Benign Sample** or **Load Malignant Sample** buttons to test sample inputs.
5. Click the prediction button to analyze the measurements.
6. View the classification result.

### Prediction Classes

| Label | Classification |
|---|---|
| 0 | Malignant |
| 1 | Benign |

## 🔄 Project Workflow

```text
Input Tumor Measurements
          |
          v
Data Preprocessing
          |
          v
Feature Extraction
          |
          v
MLP Neural Network Model
          |
          v
Tumor Classification
          |
          v
Benign or Malignant Result
```

## 📁 Main Files Description

| File | Description |
|---|---|
| `app.py` | Flask backend and prediction API endpoint |
| `train.py` | Trains the machine learning model |
| `requirements.txt` | Required Python libraries |
| `data.csv` | Breast cancer dataset |
| `model/` | Stores trained model files |
| `templates/index.html` | Main application interface |
| `static/` | CSS, JavaScript, and other frontend assets |

## 🎯 Project Objective

The main objective of this project is to demonstrate how machine learning can be used to analyze cell-nucleus measurements and classify breast tumors into Malignant or Benign categories.

It provides an interactive platform to understand machine learning-based classification and its potential applications in healthcare research.

## ⚠️ Disclaimer

This project is developed for **educational and demonstration purposes only**. It is not a certified medical diagnostic tool and should not be used for actual medical diagnosis or treatment decisions.

## 👨‍💻 Author

**Suraj Mohan Byatnal**

Machine Learning | Python | Data Science
