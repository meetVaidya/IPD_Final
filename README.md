Dataset

We extracted climate data from the NASA POWER platform for the following five cities:

Zurich [47.35, 8.55]

Milan [45.47, 9.18]

Dijon [47.32, 5.06]

Innsbruck [47.27, 11.43]

Karlsruhe [48.99, 8.43]

Each dataset comprises approximately 80,000 entries spanning 10 years (01.01.2013 – 31.12.2022), with 15 variables, including 9 hourly-measured climate features:

Radiance (W/m²): Total solar irradiance incident on a horizontal plane.

Temperature (°C): Average air temperature at 2m above the surface.

Humidity (g/kg): Mass ratio of water vapor in air at 2m.

Precipitation (mm/h): Total atmospheric water vapor in a vertical column.

Wind Speed (m/s): Average wind speed at 10m above the surface.

Wind Direction (°): Average wind direction at 10m.

Frost Point (°C): Dew/frost point temperature at 2m.

Wet Bulb Temperature (°C): Adiabatic saturation temperature at 2m.

Surface Pressure (kPa): Average surface pressure at ground level.

Additional variables:

Timestamps (Year, Month, Day, Hour)

Sunrise & Sunset Times

Binary Indicator for Daylight










Data Preprocessing

Limited dataset to entries up to 31st December 2021.

Added sunrise and sunset times.

Created a binary variable indicating daylight hours.

Handled missing values (NaNs).

Prediction Pipeline

Dataset Splitting: 5-Fold Cross-Validation

Model Selection & Evaluation

Hyperparameter Tuning

Training Optimized Models

Ensembling Best-Performing Models

Deep Learning Model Training & Optimization

Final Model Evaluation

Models Implemented

Machine Learning Models:

Linear Regression

K-Nearest Neighbors (KNN)

Decision Tree Regression

Random Forest (RF)

Extreme Gradient Boosting (XGB)

AdaBoost (ADB)

CatBoost

LightGBM (LGBM)

Voting Regressor (RF, XGB, ADB)

Stacking Regressor (Ridge) (RF, XGB, ADB)

Stacking Regressor (ElasticNet) (RF, XGB, ADB)

Deep Learning Models:

Feed-Forward Neural Network (FFNN)

Long Short-Term Memory (LSTM)

Hyperparameter Tuning

Machine Learning Models:

RandomizedSearchCV (5-Folds)

20 Iterations (~3h per model)

Optimized for Negative Mean Squared Error (MSE)

Deep Learning Models:

FFNN:

Min-Max Scaling

6 Fully Connected Layers

ELU Activation

ADAM Optimizer

Batch Size: 32

Epochs: 100 (~40 mins on NVIDIA T4)

LSTM:

6 LSTM Layers + 1 Dense Layer

ReLU Activation

ADAM Optimizer

Batch Size: 32

Epochs: 40 (~30 mins on NVIDIA T4)








Instead of direct prediction, we explored estimating Zurich’s solar irradiance using climate data from four nearby cities:

Techniques Used:

Simple Averaging:


Weighted Averaging:


Coefficients (α, β, δ, γ) were determined based on normalized correlations between Zurich and neighboring cities.

Custom Dataset Approach:

Combined features from all 4 cities into a dataset with 78,888 entries × 45 features.

Used 3-Fold Cross-Validation with ML models (without re-tuning).