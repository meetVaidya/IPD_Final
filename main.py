from taipy.gui import Gui, notify
import requests
import pandas as pd
from io import StringIO

# Define the URL
url = "https://power.larc.nasa.gov/api/temporal/hourly/point"


# Function to send GET request
def get_data(start, end, latitude, longitude):
    params = {
        "start": start,
        "end": end,
        "latitude": latitude,
        "longitude": longitude,
        "community": "RE",
        "parameters": "ALLSKY_SFC_SW_DWN,ALLSKY_SFC_SW_DNI,ALLSKY_SFC_SW_DIFF,ALLSKY_KT,PS,WS10M,WD10M,WS50M,WD50M,T2M,SZA",
        "format": "CSV",
        "theme": "dark",
        "user": "DAVE",
        "time-standard": "LST",
    }

    response = requests.get(url, params=params)

    if response.status_code == 200:
        data = pd.read_csv(StringIO(response.text))
        notify(f"Data retrieved successfully! {data.shape[0]} rows found.")
        return data
    else:
        notify("Failed to retrieve data.", "ERROR")
        return None


# Define the Taipy GUI
start = "20180101"
end = "20241231"
latitude = 19.7003
longitude = 73.1829
data = None


def on_submit(state):
    state.data = get_data(state.start, state.end, state.latitude, state.longitude)


# Create the GUI layout
md = """
<|layout|columns=1|
<|{"start": start, "end": end, "latitude": latitude, "longitude": longitude}|>

<|Submit|button|on_action=on_submit|>

<|{data}|table|>
|>
"""

Gui(md).run()
