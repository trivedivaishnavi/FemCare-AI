# FemCare AI

FemCare AI is a college mini-project demo prototype for a women's health and PCOS-awareness dashboard. It is intentionally framed as a decision-support and awareness tool, not a medical product.

## What is included

The single-page React app includes cycle and symptom logging, a local timeline, a PCOS risk-awareness estimate, explainable factor contributions, weighted cycle forecasting, nutrition/mood guidance, and a printable appointment summary.

## Data and model note

This demo uses seeded synthetic data generated in-browser for presentation purposes. The training snapshot shown in the UI represents a reproducible 420-row synthetic dataset with the requested PCOS-related feature families: age, BMI, cycle length and regularity, hirsutism, acne, weight gain, hair loss, skin darkening, fast-food intake, exercise, family history, and left/right follicle counts.

The displayed model comparison represents a held-out 80/20 demonstration split. Random Forest is the selected model in the prototype because it has the stronger shown ROC-AUC (0.93) and F1 score (0.86) versus the Logistic Regression comparison. Live estimates are calculated with deterministic, lightweight feature contributions so the static demo remains fast and deployable without a backend or external API.

## Re-run / retrain direction

For a production-style mini-project extension, move the synthetic data generator into a Python FastAPI or notebook workflow, train `LogisticRegression` and `RandomForestClassifier` with a seeded train/test split, evaluate accuracy, precision, recall, F1, and ROC-AUC, then persist the selected model and SHAP explainer. The current frontend is intentionally self-contained and stores log state in React memory for a clean demo session.

## Safety

The risk screen always displays: “This is a decision-support and awareness tool, not a medical diagnosis. Please consult a healthcare professional.” Do not use this prototype to diagnose, treat, or rule out a medical condition.
