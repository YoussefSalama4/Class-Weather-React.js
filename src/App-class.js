import React from "react";
import Weather from "./Weather-class";

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());

  return String.fromCodePoint(...codePoints);
}

class App extends React.Component {
  state = {
    searchQuery: "",
    isLoading: false,
    displayLocation: "",
    weather: {},
    Error: "",
  };

  handleSearch = (e) => {
    this.setState({ searchQuery: e.target.value });
  };
  // async fetchWeather() {
  fetchWeather = async () => {
    if (this.state.searchQuery.length < 2)
      return this.setState({ weather: {} });
    try {
      // 1) Getting location (geocoding)
      this.setState({ isLoading: true });
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${this.state.searchQuery}`
      );
      const geoData = await geoRes.json();

      if (!geoData.results) throw new Error("Location not found");

      const { latitude, longitude, timezone, name, country_code } =
        geoData.results.at(0);
      this.setState({
        displayLocation: `${name} ${convertToFlag(country_code)}`,
      });

      // 2) Getting actual weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
      );
      const weatherData = await weatherRes.json();
      this.setState({ weather: weatherData.daily });
    } catch (err) {
      this.setState({ Error: err.message });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  componentDidMount() {
    this.setState({ searchQuery: localStorage.getItem("location") || "" });
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.searchQuery !== this.state.searchQuery) {
      this.setState({ Error: "" });
      this.fetchWeather();

      localStorage.setItem("location", this.state.searchQuery);
    }
  }
  render() {
    return (
      <div className="app-container">
        <div className="app">
          <h1>Classy weather</h1>
          <div>
            <input
              type="text"
              value={this.state.searchQuery}
              placeholder="Location ex: Cairo"
              onChange={this.handleSearch}
            ></input>
          </div>
          {this.state.isLoading && <p className="loader">LOADING....</p>}
          {this.state.Error && <p className="loader">{this.state.Error}</p>}
          {this.state.weather.weathercode && this.state.Error === "" && (
            <Weather
              weather={this.state.weather}
              location={this.state.displayLocation}
            />
          )}
        </div>
      </div>
    );
  }
}
export default App;
