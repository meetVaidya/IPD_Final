import io
import os

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="CSV Preprocessing Backend")

# Configure CORS - here, we allow all origins.
# For production, consider specifying only a list of allowed origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or list specific origins e.g., ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def remove_header_lines(
    filepath, start_marker="-BEGIN HEADER-", end_marker="-END HEADER-"
):
    """
    Removes lines between start_marker and end_marker (inclusive) from a file.

    Args:
        filepath (str): Path to the file.
        start_marker (str): Marker indicating the start of the header lines.
        end_marker (str): Marker indicating the end of the header lines.

    Returns:
        list: A list of strings, where each string is a line from the file with
              the header lines removed.
    """
    lines = []
    skipping = False

    # Check if file exists
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"File '{filepath}' does not exist.")

    with open(filepath, "r") as infile:
        for line in infile:
            line = line.strip()  # Remove leading/trailing whitespace
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

    Args:
        filepath (str): Path to the file.
        start_marker (str): Marker indicating the start of the header lines.
        end_marker (str): Marker indicating the end of the header lines.

    Returns:
        pandas.DataFrame: A Pandas DataFrame created from the cleaned data.
    """
    cleaned_lines = remove_header_lines(filepath, start_marker, end_marker)

    # Determine the delimiter (comma, semicolon, tab, space)
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
            print(f"Failed to read CSV with delimiter '{delimiter}': {e}")
            continue

    raise ValueError("Could not determine the delimiter for this file.")


@app.get("/preprocess")
def preprocess_csv(
    filepath: str = Query(
        ..., description="The full path to the CSV file that needs preprocessing"
    ),
):
    """
    Endpoint to preprocess a CSV file. The file is read after removing header lines,
    cleaned, and then returned as a CSV file.

    Query Parameters:
       filepath (str): The full path to the CSV file.

    Returns:
       StreamingResponse: The cleaned CSV is streamed back with proper CSV headers.
    """
    try:
        # Load the CSV into a DataFrame after header removal
        df = create_dataframe_from_cleaned_data(filepath)
    except FileNotFoundError as fe:
        raise HTTPException(status_code=404, detail=str(fe))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing CSV: {str(e)}")

    # Optional: Additional preprocessing steps (rename columns, replace missing values)
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

    # Convert the DataFrame back to CSV in memory
    output = io.StringIO()
    df.to_csv(output, index=False)
    output.seek(0)

    headers = {"Content-Disposition": "attachment; filename=cleaned_data.csv"}
    return StreamingResponse(output, media_type="text/csv", headers=headers)


# Run the app using: uvicorn main:app --reload
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
