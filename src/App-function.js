import React, { useEffect, useState } from "react";
import Weather from "./Weather-function";

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());

  return String.fromCodePoint(...codePoints);
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState(function () {
    const storedItem = localStorage.getItem("location");
    return storedItem || "";
  });
  const [isLoading, setIsLoading] = useState(false);
  const [displayLocation, setDisplayLocation] = useState();
  const [weather, setWeather] = useState("");
  const [Error, setError] = useState("");

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(
    function () {
      localStorage.setItem("location", searchQuery);

      async function fetchWeather() {
        if (searchQuery.length < 2) return setWeather({});
        try {
          // 1) Getting location (geocoding)
          setError("");
          setIsLoading(true);
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${searchQuery}`
          );
          const geoData = await geoRes.json();

          if (!geoData.results) throw new Error("Location not found");

          const { latitude, longitude, timezone, name, country_code } =
            geoData.results.at(0);

          setDisplayLocation(`${name} ${convertToFlag(country_code)}`);

          // 2) Getting actual weather
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
          );
          const weatherData = await weatherRes.json();
          setWeather(weatherData.daily);
          setError("");
        } catch (err) {
          setError("Location not found");
        } finally {
          setIsLoading(false);
        }
      }

      fetchWeather();
    },
    [searchQuery]
  );

  return (
    <div className="app-container">
      <div className="app">
        <h1>Classy weather</h1>
        <div>
          <input
            type="text"
            value={searchQuery}
            placeholder="Location ex: Cairo"
            onChange={handleSearch}
          ></input>
        </div>
        {isLoading && <p className="loader">LOADING....</p>}
        {Error && <p className="loader">{Error}</p>}

        {weather.weathercode && Error === "" && (
          <Weather weather={weather} location={displayLocation} />
        )}
      </div>
    </div>
  );
}
