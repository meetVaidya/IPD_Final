# import pandas as pd


# def remove_header_lines(
#     filepath, start_marker="-BEGIN HEADER-", end_marker="-END HEADER-"
# ):
#     """Removes lines between start_marker and end_marker (inclusive) from a file.

#     Args:
#         filepath (str): Path to the file.
#         start_marker (str): Marker indicating the start of the header lines.
#         end_marker (str): Marker indicating the end of the header lines.

#     Returns:
#         list: A list of strings, where each string is a line from the file with
#               the header lines removed.
#     """
#     lines = []
#     skipping = False
#     with open(filepath, "r") as infile:
#         for line in infile:
#             line = line.strip()  # Remove leading/trailing whitespace
#             if line == start_marker:
#                 skipping = True
#                 continue
#             if line == end_marker:
#                 skipping = False
#                 continue
#             if not skipping:
#                 lines.append(line)
#     return lines


# def create_dataframe_from_cleaned_data(
#     filepath, start_marker="-BEGIN HEADER-", end_marker="-END HEADER-"
# ):
#     """Creates a Pandas DataFrame from a file after removing header lines.

#     Args:
#         filepath (str): Path to the file.
#         start_marker (str): Marker indicating the start of the header lines.
#         end_marker (str): Marker indicating the end of the header lines.

#     Returns:
#         pandas.DataFrame: A Pandas DataFrame created from the cleaned data.
#     """
#     cleaned_lines = remove_header_lines(filepath, start_marker, end_marker)

#     # Determine the delimiter (comma, semicolon, tab, space)
#     # Try different delimiters to find the correct one.  The CSV should now be clean.
#     for delimiter in [",", ";", "\t", " "]:
#         try:
#             # Attempt to create DataFrame
#             df = pd.read_csv(
#                 io.StringIO("\n".join(cleaned_lines)),
#                 sep=delimiter,
#                 engine="python",
#                 skipinitialspace=True,
#             )
#             print(f"Successfully read CSV with delimiter: '{delimiter}'")
#             return df  # Return the DataFrame if successful

#         except pd.errors.ParserError as e:
#             print(
#                 f"Failed to read CSV with delimiter '{delimiter}': {e}"
#             )  # For each try, will tell you failed or not.
#             continue  # Try the next delimiter

#     # If all delimiters fail, raise an error:
#     raise ValueError("Could not determine the delimiter for this file.")


# # --- Example Usage ---
# import io  # Import io module.

# try:
#     df = create_dataframe_from_cleaned_data("Datasets/nasa_power_data.csv")
#     print(df.head())  # Display the first few rows of the DataFrame
# except ValueError as e:
#     print(e)

# column_mapping = {
#     "MO": "MONTH",
#     "DY": "DAY",
#     "HR": "HOUR",
#     "ALLSKY_SFC_SW_DWN": "DWN",
#     "ALLSKY_SFC_SW_DNI": "DNI",
#     "ALLSKY_SFC_SW_DIFF": "DIFF",
#     "ALLSKY_KT": "CI",
#     "T2M": "TEMP",
# }

# df["CI"] = df["CI"].replace(-999, np.nan)
