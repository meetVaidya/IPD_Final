<h1 align="center">
Solar Irradiance Prediction Project</h1>

<div align="center">
  <a href="https://www.linkedin.com/in/eliatorre/">Elia Torre</a>,
  <a> Cyrill Albrecht</a>,
  <a> Martha Rösler</a>,
  <a href="https://www.linkedin.com/in/mario-baumgartner-101ba2168/"> Mario Baumgartner</a>
  <p><a href="https://www.ics.uzh.ch/en/">Institute for Computational Science </a>, University of Zurich, Zurich, Switzerland</p>
</div>

>**<p align="justify"> Abstract:** *This repository presents the research undertaken in the Vodafone Data Science Challenge (2021). The purpose of the challenge was that of predicting the nature of the Vodafone customers interactions with Tobi Digital Assistant to enhance Vodafone Customer Service. The research was based on a dataset of supervised interactions parameters used to classify customers communications with Tobi. Leveraging Convolutional Neural Networks (CNN) along with some inspiration taken from sequence classification models and deep recommender systems, we designed a model to take two inputs, one representing the user history on past interactions and one composed by the sessions events in order to draw conclusions on the nature of the interactions.*

<hr/>

## Introduction 
Many aspects of modern life are reliant on solar energy, from powering our homes and businesses to providing energy for transportation and industry. In this project, we want to accurately predict Solar Irradiance at a specific location starting from meteorological and time factors. A model of the Irradiance can help us better understand and manage this valuable resource, which in turn can lead to more efficient and sustainable energy use. This analysis has a wide range of applications, including improving solar power systems and optimizing solar energy production in different industries. For instance, precise predictions of Solar Irradiance can help solar energy firms in making informed decisions regarding the placement of new solar panels and ways to enhance their efficiency. Furthermore, this examination can also be used to anticipate fluctuations in Solar Irradiance resulting from climate change, which can assist policymakers in developing more effective measures to tackle its impact.

<hr/>

## Dataset
We created five different data sets from [NASA Platform](https://power.larc.nasa.gov/data-access-viewer/). The NASA POWER project combines data from different NASA research projects with the goal of an easily accessible data to study the climate. The five data sets refer to five different cities:
1. Zurich [Latitude: 47.35, Longitude: 8.55]
2. Milan [Latitude: 45.47, Longitude: 9.18]
3. Dijon [Latitude: 47.32, Longitude: 5.06]
4. Innsbruck [Latitude: 47.27, Longitude: 11.43]
5. Karlsruhe [Latitude: 48.99, Longitude: 8.43]

Each data set consists of approximately 80k entries with 15 variables of which 9 hourly-measured features on a time-span of 10 years ranging from 01.01.2013 until 31.12.2022:
1. The radiance [W/m2]: The total solar irradiance incident (direct plus diffuse) on a horizontal plane at the surface of the earth under all sky conditions.
2. Temperature [C]: The average air (dry bulb) temperature at 2 meters above the surface of the earth in Fahrenheit.
3. Humidity [g/kg]: The ratio of the mass of water vapor to the total mass of air at 2 meters.
4. Precipitation [mm/h]: The total atmospheric water vapor contained in a vertical column of the atmosphere.
5. Wind speed [m/s]: The average wind speed at 10 meters above the surface of the earth.
6. Wind direction [◦]: The average wind direction at 10 meters above the surface of the earth.
7. Frost point [C]: The dew/frost point temperature at 2 meters above the surface of the earth.
8. Wet bulb temperature [C]: The adiabatic saturation temperature which can be measured by a thermometer covered in a water-soaked cloth over which air is passed at 2 meters above the surface of the earth.
9. Surface Pressure [kPa]: The average surface pressure at the surface of the earth.
And additional variables such as:
10. Timestamps: year, month, day, hour.
11. Time of sunrise.
12. Time of sunset.
