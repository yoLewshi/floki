const request = require("request-promise-native");
const bent = require("bent");
const config = require("../config.js");

const getJSON = bent("json");
var weather = (function() {
  var emojiSummaries = {
    rain: "🌧️",
    Rain: "🌧️",
    cloudy: "☁️",
    Clouds: "☁️",
    "very-cloudy-night": "☁️",
    "partly-cloudy-night": "☁️",
    "very-cloudy-day": "🌥️",
    "partly-cloudy-day": "⛅",
    "sun-showers": "🌦️",
    "Clear": "☀️",
    "clear-day": "☀️",
    fog: "🌫️",
    Haze: "🌁",
    wind: "💨",
    "clear-night": "🌌",
    snow: "🌨️",
    Mist: "🌁"
  };

  var notifyWeatherDarkSky = function(program, p_Data) {
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

  var notifyWeather = function(program, p_Data, forecast_data) {
    var forecast = forecast_data.list;

    var summaryLines = [];

    var currentMinute = new Date().getMinutes() + 1;
    const dtNow = Math.round((new Date()).getTime() / 1000);
    // weight by how far through the current hour we are
    // at start of hour only the current forecast is important, this then shifts at the end of the hour to look at the next hours forecast   
    
    const rainNow = p_Data.rain ? 1 : 0;
    let index;
    const currentForecastBlock = forecast.find((block, i) => {
      index = i;
      return block.dt > dtNow;
    })
    // forecast is in 3 hour blocks
    const currentForecastWeight = (currentForecastBlock.dt - dtNow) / (60 * 60 * 3);

    const nextForecastBlock = forecast[index + 1];
    // forecast is in 3 hour blocks
    const nextForecastWeight = (nextForecastBlock.dt - dtNow) / (60 * 60 * 3);

    var rainRisk = (rainNow + (rainNow * (currentForecastWeight)) + currentForecastBlock.pop * (currentForecastWeight)) /3;
        //(nextForecastBlock.pop * (1 - nextForecastWeight)));
  
    console.log(rainNow, currentForecastWeight);

    const slotsToCheck = 8;
    const rainRiskDay = forecast.reduce((agg, slot, i) => {
      if(i>=slotsToCheck) {
        return agg;
      }
      agg += slot.pop;

      return agg;
    }, 0) / slotsToCheck;

    if (program.opts().touchbar) {
      summaryLines = [
        (emojiSummaries[p_Data.weather[0].main]
          ? emojiSummaries[p_Data.weather[0].main]
          : p_Data.weather[0].main) +
          " " +
          convertKToC(p_Data.main.feels_like) +
          "°C  " +
          Math.round(rainRisk * 100) +
          "% 🌧️"
      ];
    } else if (program.opts().quiet) {
      summaryLines = [
        (emojiSummaries[p_Data.weather[0].main]
          ? emojiSummaries[p_Data.weather[0].main]
          : p_Data.weather[0].main) +
          " " +
          convertKToC(p_Data.main.feels_like) +
          "°C  " +
          Math.round(rainRisk * 100) +
          "% 🌧️",
        "Today it's between " +
          convertKToC(p_Data.main.temp_min) +
          " -> " +
          convertKToC(p_Data.main.temp_max) +
          "°C",
        p_Data.weather[0].description +
          "\n" +
          Math.round(rainRiskDay * 100) +
          "% chance of rain today"
      ];
    } else {
      summaryLines = [
        "Right now it's about: " +
          convertKToC(p_Data.main.feels_like) +
          "°C",
        p_Data.weather[0].description +
          "\n\n" +
          Math.round(rainRisk * 100) +
          "% chance of rain" +
          "\n\n" +
          convertmsToKmh(p_Data.wind.speed) +
          "km/h winds" +
          "\n\n" +
          p_Data.weather[0].description ,
        "Today it's between " +
          convertKToC(p_Data.main.temp_min) +
          " -> " +
          convertKToC(p_Data.main.temp_max) +
          "°C",
        p_Data.weather[0].description +
          "\n\n" +
          Math.round(rainRiskDay * 100) +
          "% chance of rain today"
      ];
    }

    summaryLines.map(line => {
      console.log(line);
    });
  };

  var convertFToC = function(p_Farenheit) {
    return Math.round(((p_Farenheit - 32) * 5) / 9);
  };

  var convertKToC = function(p_Kelvin) {
    return Math.round((p_Kelvin - 273.15));
  };

  var convertmsToKmh = function(p_speed) {
    return Math.round((p_speed * 3.6));
  };

  const headers = {
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36"
  };

  // darksky api ending dec 2022
  var getWeatherUpdate = function(program) {

    return Promise.all([getJSON(
      //`https://api.darksky.net/forecast/${config.weather.apiKey}/` +
      `https://api.openweathermap.org/data/2.5/weather` +
        `?lat=${config.weather.location.latitude}` +
        `&lon=${config.weather.location.longitude}` +
        `&appid=${config.weather.apiKey}`,
      "GET",
      200,
      headers
    ),
    getJSON(
      `https://api.openweathermap.org/data/2.5/forecast` +
        `?lat=${config.weather.location.latitude}` +
        `&lon=${config.weather.location.longitude}` +
        `&appid=${config.weather.apiKey}`,
      "GET",
      200,
      headers
    )]).then(function(p_Response) {
        //console.log(p_Response);
        const [current_response, forecast_response] = p_Response;
        return notifyWeather.bind(null, program)(current_response, forecast_response);
      })
      .catch(error => {
        console.log(error)
        console.log("- - -");
      });
  };

  return {
    getWeatherUpdate: getWeatherUpdate
  };
})();

module.exports = weather;
