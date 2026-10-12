# FemCare AI

**An interactive women’s health application for menstrual cycle tracking, symptom insights, and explainable PCOS risk awareness.**

FemCare AI helps users explore menstrual health patterns and organize information for conversations with healthcare professionals. The application combines cycle forecasting, symptom logging, wellness guidance, and printable appointment summaries in one interface.

> FemCare AI is an educational prototype for awareness and decision support. It does not provide medical diagnoses or replace professional healthcare advice.

## Features

### Cycle and Symptom Tracking

Record menstrual cycle information and symptoms during the current session.

### Health Timeline

Review logged information chronologically to explore patterns over time.

### PCOS Risk Awareness

Explore an illustrative estimate based on menstrual patterns, reported symptoms, lifestyle factors, and family history.

### Explainable Insights

View individual factor contributions to understand how inputs influence the displayed estimate.

### Cycle Forecasting

Explore upcoming cycle estimates using a weighted forecasting approach.

### Nutrition and Mood Guidance

Access general wellness information related to nutrition and mood.

### Appointment Summary

Generate a printable summary to support conversations with a healthcare professional.

## Technology Stack

### Application Development

The project uses **React 19** and **TypeScript 5.6**, with **Vite 7** for frontend development and production builds.

### Styling and Interface Libraries

The project includes **Tailwind CSS 4**, **Radix UI**, **Lucide React**, and **Framer Motion** for styling, interface components, icons, and animation support.

### Visualization and Date Selection

**Recharts** and **React Day Picker** are included for charting and calendar components.

### Forms and Validation

**React Hook Form**, **Zod**, and **Hookform Resolvers** support form handling and schema validation.

### Routing

**Wouter** is included for client side navigation.

### Server Infrastructure

The production build bundles an **Express** server entry point with **esbuild** for execution in **Node.js**.

### Development Tools

**pnpm** manages dependencies, **Prettier** formats source files, and **TypeScript** provides static checks. **Vitest** is included as a testing dependency.

## Getting Started

### Prerequisites

Install a Node.js version compatible with Vite 7 and the pnpm version declared in `package.json`.

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/trivedivaishnavi/FemCare-AI.git
cd FemCare-AI
pnpm install
```

### Local Development

Start the Vite development server:

```bash
pnpm dev
```

Open the local URL displayed in the terminal.

### Production Build

Build the frontend and bundle the server:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

The `start` script uses POSIX environment variable syntax. In Windows PowerShell, run:

```powershell
$env:NODE_ENV = "production"
node dist/index.js
```

### Additional Commands

Check TypeScript types:

```bash
pnpm check
```

Preview the frontend build:

```bash
pnpm preview
```

Format source files:

```bash
pnpm format
```

## How It Works

Live risk awareness estimates are calculated in the browser using deterministic feature contributions. The interface shows the contributions of individual factors to make the calculation understandable.

The model comparison displayed in the application is separate from the live estimation logic. Live estimates are not predictions from a deployed Random Forest model.

Logs are held in React memory for the current session. Refreshing the page may clear this information.

## Demonstration Dataset

FemCare AI uses seeded synthetic data generated in the browser. The reproducible dataset contains **420 synthetic records** covering:

1. Age and BMI
2. Cycle length and regularity
3. Hirsutism and acne
4. Weight gain and hair loss
5. Skin darkening
6. Fast food intake and exercise
7. Family history of PCOS
8. Left and right ovarian follicle counts

These records support educational exploration and do not represent a real patient cohort.

## Model Comparison

The interface presents a demonstration comparison between **Logistic Regression** and **Random Forest**, representing an **80/20 training and evaluation split**.

Random Forest is displayed as the selected model, with a **ROC AUC of 0.93** and an **F1 score of 0.86**.

These displayed metrics describe the synthetic data demonstration. They do not establish clinical accuracy or validation on real patient data.

## Current Limitations

The application has not been clinically validated. Synthetic data cannot establish performance across real patient populations.

Risk awareness estimates cannot diagnose, confirm, or exclude PCOS. Cycle forecasts are approximate and may be less reliable for irregular cycles.

Logs are session based and do not provide persistent storage.

## Future Development

1. Create a reproducible Python workflow for training and evaluation.
2. Train and compare Logistic Regression and Random Forest models.
3. Report accuracy, precision, recall, F1, and ROC AUC from reproducible evaluation runs.
4. Integrate a persisted model through a backend service.
5. Add SHAP explanations for trained model predictions.
6. Introduce persistent logging with appropriate privacy and security controls.
7. Evaluate the application with appropriately sourced data and healthcare professional input.

## Responsible Use

FemCare AI is intended for education and demonstration. Consult a qualified healthcare professional for concerns about menstrual health, symptoms, or PCOS.
