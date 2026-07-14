const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const message = document.getElementById("message");
const weatherContent = document.getElementById("weather-content");
const forecastList = document.getElementById("forecast-list");

const weatherCodes = {
  0: { text: "Clear sky", icon: "☀️" },
  1: { text: "Mainly clear", icon: "🌤️" },
  2: { text: "Partly cloudy", icon: "⛅" },
  3: { text: "Overcast", icon: "☁️" },
  45: { text: "Foggy", icon: "🌫️" },
  48: { text: "Foggy", icon: "🌫️" },
  51: { text: "Light drizzle", icon: "🌦️" },
  53: { text: "Drizzle", icon: "🌦️" },
  55: { text: "Heavy drizzle", icon: "🌧️" },
  61: { text: "Light rain", icon: "🌦️" },
  63: { text: "Rain", icon: "🌧️" },
  65: { text: "Heavy rain", icon: "🌧️" },
  71: { text: "Light snow", icon: "🌨️" },
  73: { text: "Snow", icon: "❄️" },
  75: { text: "Heavy snow", icon: "❄️" },
  80: { text: "Rain showers", icon: "🌦️" },
  81: { text: "Rain showers", icon: "🌧️" },
  82: { text: "Heavy showers", icon: "⛈️" },
  95: { text: "Thunderstorm", icon: "⛈️" },
  96: { text: "Thunderstorm with hail", icon: "⛈️" },
  99: { text: "Thunderstorm with hail", icon: "⛈️" }
};

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  getWeather(cityInput.value.trim());
});

async function getWeather(city) {
  if (!city) return;

  message.textContent = "Loading weather details...";
  weatherContent.classList.add("hidden");

  try {
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found. Please enter a valid city name.");
    }

    const location = geoData.results[0];
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,precipitation_probability_max&timezone=auto`
    );

    const weatherData = await weatherResponse.json();
    showWeather(location, weatherData);
    message.textContent = "";
    
  } catch (error) {
    message.textContent = error.message;
  }
}

function showWeather(location, data) {
  const current = data.current;
  const daily = data.daily;
  const condition = weatherCodes[current.weather_code] || weatherCodes[0];

  document.getElementById("city-name").textContent =
    `${location.name}, ${location.country}`;

  document.getElementById("date").textContent = new Date().toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }
  );

  document.getElementById("condition").textContent = condition.text;
  document.getElementById("weather-icon").textContent = condition.icon;
  document.getElementById("temperature").textContent =
    Math.round(current.temperature_2m);

  document.getElementById("feels-like").textContent =
    Math.round(current.apparent_temperature);

  document.getElementById("humidity").textContent =
    `${current.relative_humidity_2m}%`;

  document.getElementById("wind-speed").textContent =
    `${Math.round(current.wind_speed_10m)} km/h`;

  document.getElementById("rain-chance").textContent =
    `${daily.precipitation_probability_max[0]}%`;

  document.getElementById("sunrise").textContent = new Date(
    daily.sunrise[0]
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  showForecast(daily);
  weatherContent.classList.remove("hidden");
}

function showForecast(daily) {
  forecastList.innerHTML = "";

  for (let i = 0; i < 5; i++) {
    const date = new Date(daily.time[i]);
    const condition = weatherCodes[daily.weather_code[i]] || weatherCodes[0];

    const card = document.createElement("article");
    card.className = "forecast-card";

    card.innerHTML = `
      <p class="day">${date.toLocaleDateString("en-US", {
        weekday: "short"
      })}</p>
      <span class="icon">${condition.icon}</span>
      <p>${condition.text}</p>
      <p class="temp">
        ${Math.round(daily.temperature_2m_max[i])}° /
        ${Math.round(daily.temperature_2m_min[i])}°
      </p>
    `;

    forecastList.appendChild(card);
  }
}

// Default city when website opens
getWeather("New Delhi");