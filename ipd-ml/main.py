import io
import os
import re
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import (
    RandomForestRegressor,
    AdaBoostRegressor,
    VotingRegressor,
)
from sklearn.tree import DecisionTreeRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from xgboost import XGBRegressor

app = FastAPI(title="CSV Preprocessing Backend")

# Configure CORS - allow all origins for now.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify allowed origins.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def remove_header_lines(
    filepath, start_marker="-BEGIN HEADER-", end_marker="-END HEADER-"
):
    """
    Removes lines between start_marker and end_marker (inclusive) from a file.
    Returns a list of lines.
    """
    lines = []
    skipping = False

    if not os.path.exists(filepath):
        raise FileNotFoundError(f"File '{filepath}' does not exist.")

    with open(filepath, "r") as infile:
        for line in infile:
            line = line.strip()
            if line == start_marker:
                skipping = True
                continue
            if line == end_marker:
                skipping = False
                continue
            if not skipping:
                lines.append(line)
    return lines


def create_dataframe_from_cleaned_data(
    filepath, start_marker="-BEGIN HEADER-", end_marker="-END HEADER-"
):
    """
    Creates a Pandas DataFrame from a file after removing header lines.
    """
    cleaned_lines = remove_header_lines(filepath, start_marker, end_marker)

    # Try different delimiters.
    for delimiter in [",", ";", "\t", " "]:
        try:
            df = pd.read_csv(
                io.StringIO("\n".join(cleaned_lines)),
                sep=delimiter,
                engine="python",
                skipinitialspace=True,
            )
            print(f"Successfully read CSV with delimiter: '{delimiter}'")
            return df
        except pd.errors.ParserError as e:
            print(f"Failed with delimiter '{delimiter}': {e}")
            continue
    raise ValueError("Could not determine the delimiter for this file.")


def run_ml_evaluation(combined_df):
    """
    Given the preprocessed combined DataFrame, this function splits the data,
    trains a model (VotingRegressor) and then returns:
      • Evaluation metrics (RMSE, MAE, R2)
      • Predictions versus actual values as lists.
      • A plot object with x (actual) and y (predicted) arrays.
    """
    target = "IRRADIANCE"
    features = combined_df.drop(columns=[target]).columns

    X = combined_df[features]
    y = combined_df[target]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Define base models.
    xgb_model = XGBRegressor(n_estimators=100, random_state=42, verbosity=0)
    rf = RandomForestRegressor(
        n_jobs=-1, n_estimators=30, max_depth=10, random_state=42
    )
    abr = AdaBoostRegressor(
        estimator=DecisionTreeRegressor(max_depth=3),
        n_estimators=50,
        learning_rate=1.0,
        random_state=42,
    )
    estimators = [("xgb", xgb_model), ("rf", rf), ("abr", abr)]

    # Use VotingRegressor for demonstration.
    model = VotingRegressor(estimators=estimators, n_jobs=-1)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    results = {
        "evaluation_metrics": {"RMSE": rmse, "MAE": mae, "R2": r2},
        "predictions": {
            "actual": y_test.tolist(),  # Convert to list for JSON serialization.
            "predicted": y_pred.tolist(),
        },
        "plot": {
            "x": y_test.tolist(),  # For a plot of actual vs predicted.
            "y": y_pred.tolist(),
        },
    }
    return results


@app.get("/preprocess")
def preprocess_csv(
    filepath: str = Query(
        ..., description="The full path to the CSV file that needs preprocessing"
    ),
):
    """
    This endpoint loads a CSV file, cleans wrapped header lines, renames/replaces columns,
    extracts latitude and longitude from the filename, performs further preprocessing (combining data,
    computing a weighted 'IRRADIANCE', imputing missing CI, and dropping redundant columns),
    and calls an ML function.

    In addition to streaming the cleaned CSV file back to the client,
    the combined dataframe is also saved as "cleaned_data.csv" in the same directory as main.py.
    """
    try:
        df = create_dataframe_from_cleaned_data(filepath)
    except FileNotFoundError as fe:
        raise HTTPException(status_code=404, detail=str(fe))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing CSV: {str(e)}")

    # Rename columns.
    column_mapping = {
        "MO": "MONTH",
        "DY": "DAY",
        "HR": "HOUR",
        "ALLSKY_SFC_SW_DWN": "DWN",
        "ALLSKY_SFC_SW_DNI": "DNI",
        "ALLSKY_SFC_SW_DIFF": "DIFF",
        "ALLSKY_KT": "CI",
        "T2M": "TEMP",
    }
    common_columns = set(df.columns).intersection(column_mapping.keys())
    if common_columns:
        df = df.rename(columns=column_mapping)

    if "CI" in df.columns:
        df["CI"] = df["CI"].replace(-999, np.nan)

    # Extract latitude and longitude from filename.
    file_name = os.path.basename(filepath)
    pattern = r"nasa_power_data_([0-9]+\.[0-9]+)_([0-9]+\.[0-9]+)\.csv"
    match = re.match(pattern, file_name)
    if match:
        lat_val = float(match.group(1))
        long_val = float(match.group(2))
    else:
        raise HTTPException(
            status_code=400,
            detail="Unable to extract latitude and longitude from the filename.",
        )
    df["LAT"] = lat_val
    df["LONG"] = long_val

    # Further preprocessing:
    # For demonstration, assume the combined dataset comes from four parts.
    df_1, df_2, df_3, df_4 = df.copy(), df.copy(), df.copy(), df.copy()
    combined_df = pd.concat([df_1, df_2, df_3, df_4], ignore_index=True)
    print("Combined dataframe shape:", combined_df.shape)

    # Compute variance-based weights from irradiance components.
    try:
        variances = combined_df[["DWN", "DNI", "DIFF"]].var()
    except KeyError as ke:
        raise HTTPException(
            status_code=400, detail=f"Missing expected irradiance columns: {ke}"
        )
    total_variance = variances.sum()
    weights = variances / total_variance

    combined_df["IRRADIANCE"] = (
        combined_df["DWN"] * weights["DWN"]
        + combined_df["DNI"] * weights["DNI"]
        + combined_df["DIFF"] * weights["DIFF"]
    )

    if "IRRADIANCE" in df.columns:
        df["IRRADIANCE"] = df["IRRADIANCE"].replace(-999, np.nan)

    # Impute missing 'CI' values.
    imputer = SimpleImputer(strategy="mean")
    combined_df["CI"] = imputer.fit_transform(combined_df[["CI"]])
    # Drop raw irradiance columns.
    cols_to_drop = ["DNI", "DIFF", "DWN"]
    combined_df = combined_df.drop(columns=cols_to_drop)

    # Run ML model for analysis (for console logging).
    ml_results = run_ml_evaluation(combined_df)
    print("ML Evaluation Results:", ml_results)

    # Save the combined dataframe to the local directory.
    local_output_path = os.path.join(os.getcwd(), "cleaned_data.csv")
    combined_df.to_csv(local_output_path, index=False)
    print(f"Combined dataframe saved locally to: {local_output_path}")

    # Also stream the CSV back in the response.
    output = io.StringIO()
    combined_df.to_csv(output, index=False)
    output.seek(0)
    headers = {"Content-Disposition": "attachment; filename=cleaned_data.csv"}
    return StreamingResponse(output, media_type="text/csv", headers=headers)


@app.get("/evaluate")
def evaluate_ml():
    """
    This endpoint reads the CSV file 'cleaned_data.csv' (assumed to be in the current working directory),
    performs further processing, runs the ML model for evaluation, and returns a JSON object containing
    evaluation metrics, predictions (actual vs predicted), and plot data.
    """
    # Define the path for the cleaned_data.csv file.
    filepath = os.path.join(os.getcwd(), "cleaned_data.csv")

    # Attempt to read the CSV.
    if not os.path.exists(filepath):
        raise HTTPException(
            status_code=404, detail=f"File '{filepath}' does not exist."
        )

    try:
        # You can either use create_dataframe_from_cleaned_data if header clean-up is needed:
        # df = create_dataframe_from_cleaned_data(filepath)
        # Or, if the file is already clean, simply use:
        df = pd.read_csv(filepath, engine="python", on_bad_lines="skip")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing CSV: {str(e)}")

    # Run ML evaluation.
    evaluation_results = run_ml_evaluation(df)

    # Return evaluation results as JSON.
    return JSONResponse(content=evaluation_results)


# Run the app:
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
