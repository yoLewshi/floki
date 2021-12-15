const request = require("request-promise-native");
const bent = require("bent");
const config = require("../config.js");

const getJSON = bent("json");
var weather = (function() {
  var emojiSummaries = {
    rain: "🌧️",
    cloudy: "☁️",
    "very-cloudy-night": "☁️",
    "partly-cloudy-night": "☁️",
    "very-cloudy-day": "🌥️",
    "partly-cloudy-day": "⛅",
    "sun-showers": "🌦️",
    "clear-day": "☀️",
    fog: "🌫️",
    wind: "💨",
    "clear-night": "🌌",
    snow: "🌨️"
  };

  var notifyWeather = function(program, p_Data) {
    var l_TodaySummary = p_Data.daily.data[0];

    var summaryLines = [];

    var currentMinute = new Date().getMinutes() + 1;
    // weight by how far through the current hour we are
    // at start of hour only the current forecast is important, this then shifts at the end of the hour to look at the next hours forecast
    var rainRisk =
      (p_Data.hourly.data[0].precipProbability * (60 - currentMinute) +
        (p_Data.hourly.data.length > 1
          ? p_Data.hourly.data[1].precipProbability * currentMinute
          : p_Data.hourly.data[0].precipProbability)) /
      60;

    if (program.opts().touchbar) {
      summaryLines = [
        (emojiSummaries[p_Data.currently.icon]
          ? emojiSummaries[p_Data.currently.icon]
          : p_Data.currently.icon) +
          " " +
          convertToC(p_Data.currently.apparentTemperature) +
          "°C  " +
          Math.round(rainRisk * 100) +
          "% 🌧️"
      ];
    } else if (program.opts().quiet) {
      summaryLines = [
        (emojiSummaries[p_Data.currently.icon]
          ? emojiSummaries[p_Data.currently.icon]
          : p_Data.currently.icon) +
          " " +
          convertToC(p_Data.currently.apparentTemperature) +
          "°C  " +
          Math.round(rainRisk * 100) +
          "% 🌧️",
        "Today it's between " +
          convertToC(l_TodaySummary.apparentTemperatureMin) +
          " -> " +
          convertToC(l_TodaySummary.apparentTemperatureMax) +
          "°C",
        l_TodaySummary.summary +
          "\n" +
          Math.round(l_TodaySummary.precipProbability * 100) +
          "% chance of rain today"
      ];
    } else {
      summaryLines = [
        "Right now it's about: " +
          convertToC(p_Data.currently.apparentTemperature) +
          "°C",
        p_Data.currently.summary +
          "\n\n" +
          Math.round(rainRisk * 100) +
          "% chance of rain" +
          "\n\n" +
          Math.round(p_Data.currently.windSpeed) +
          "mph winds" +
          "\n\n" +
          p_Data.hourly.summary,
        "Today it's between " +
          convertToC(l_TodaySummary.apparentTemperatureMin) +
          " -> " +
          convertToC(l_TodaySummary.apparentTemperatureMax) +
          "°C",
        l_TodaySummary.summary +
          "\n\n" +
          Math.round(l_TodaySummary.precipProbability * 100) +
          "% chance of rain today"
      ];
    }

    summaryLines.map(line => {
      console.log(line);
    });
  };

  var convertToC = function(p_Farenheit) {
    return Math.round(((p_Farenheit - 32) * 5) / 9);
  };

  const headers = {
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36"
  };

  // darksky api ending dec 2022
  var getWeatherUpdate = function(program) {
    return getJSON(
      `https://api.darksky.net/forecast/${config.weather.darkSkyKey}/` +
        config.weather.location.latitude +
        "," +
        config.weather.location.longitude,
      "GET",
      200,
      headers
    )
      .then(function(p_Response) {
        return notifyWeather.bind(null, program)(p_Response);
      })
      .catch(error => {
        console.log("- - -");
      });
  };

  return {
    getWeatherUpdate: getWeatherUpdate
  };
})();

module.exports = weather;
