// ---GET ELEMENTS FROM HTML---
let cityInput = document.getElementById("cityInputField");
let searchCityBtn = document.getElementById("citySearchBtn");
let resultCity = document.getElementById("resCity");
let resultTemp = document.getElementById("currentTemp");
let time = document.getElementById("time");
let minTemp = document.getElementById("minTemp");
let maxTemp = document.getElementById("maxTemp");
let feelTemp = document.getElementById("feelTemp");
let weather = document.getElementById("resWeather");
let windSpeed = document.getElementById("resWindSpeed");
let windDeg = document.getElementById("resWindDeg");
let toggleTempBtn = document.getElementById("tempToggle");
let allResults = document.getElementById("allResults");
let icon = document.getElementById("icon");
let humidityMain = document.getElementById("humidity");
let loadingOverlay = document.getElementById("loadingOverlay");

let cityName = "";
let temps = {};
let forecastTemps = [];
let isCelsius = true;
let apiKey = "808910939ecd307e83962c1c171b7b11";

// ---UTILITY FUNCTIONS---
function showLoading() {
  loadingOverlay.classList.add('show');
}

function hideLoading() {
  loadingOverlay.classList.remove('show');
}

function showResults() {
  allResults.classList.remove('results-hidden');
}

function hideResults() {
  allResults.classList.add('results-hidden');
}

function formatTime(timestamp, timezone) {
  const date = new Date((timestamp + timezone) * 1000);
  const options = { 
    timeZone: "UTC", 
    hour12: true,
    hour: 'numeric',
    minute: '2-digit',
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  };
  return date.toLocaleString("en-US", options);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// ---GET DATA FROM APIs ---
function handleInputChange(e) {
  cityName = e.target.value;
}

function fetchDataCityName() {
  if (!cityName.trim()) {
    alert("Please enter a city name");
    return;
  }

  showLoading();
  hideResults();

  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);

      temps = {
        current: data.main.temp,
        feels: data.main.feels_like,
        min: data.main.temp_min,
        max: data.main.temp_max,
      };

      const formattedTime = formatTime(data.dt, data.timezone);

      resultCity.innerHTML = capitalizeFirstLetter(data.name);
      time.innerHTML = formattedTime;
      weather.innerHTML = capitalizeFirstLetter(data.weather[0].description);
      icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
      icon.alt = data.weather[0].description;
      windSpeed.innerHTML = `${data.wind.speed} m/s`;
      humidityMain.innerHTML = `${data.main.humidity}%`;

      displayTempUnit();
      changeBgClass(data.weather[0].id);
      fiveDayWeatherData();
      
      hideLoading();
      showResults();
    })
    .catch((err) => {
      console.error(err);
      hideLoading();
      alert("City not found. Please check the spelling and try again.");
    });
}

function fiveDayWeatherData() {
  fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);

      const days = data.list.filter((item) => item.dt_txt.includes("12:00:00"));
      forecastTemps = []; // Reset forecast temps

      for (let i = 0; i < Math.min(5, days.length); i++) {
        const dayData = days[i];
        const dayTemp = dayData.main.temp;
        const iconCode = dayData.weather[0].icon;
        const dayName = new Date(dayData.dt * 1000).toLocaleString("en-US", {
          weekday: "short",
        });
        const dayWeather = dayData.weather[0].description;

        // Store the celsius temperature for conversion
        forecastTemps[i] = dayTemp;

        const tempElement = document.getElementById(`day${i + 1}temp`);
        const nameElement = document.getElementById(`day${i + 1}name`);
        const weatherElement = document.getElementById(`day${i + 1}weather`);
        const iconElement = document.getElementById(`icon${i + 1}day`);

        if (tempElement) tempElement.innerHTML = `${dayTemp.toFixed(0)}°C`;
        if (nameElement) nameElement.innerHTML = dayName;
        if (weatherElement) weatherElement.innerHTML = capitalizeFirstLetter(dayWeather);
        if (iconElement) {
          iconElement.src = `https://openweathermap.org/img/wn/${iconCode}.png`;
          iconElement.alt = dayWeather;
        }
      }
    })
    .catch((err) => {
      console.error(err);
      alert("Unable to fetch forecast data");
    });
}

// ---GEOLOCATION---
function fetchDataGeolocation(lat, lon) {
  showLoading();
  
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      cityName = data.name;
      cityInput.value = cityName;
      
      // Process the data directly here instead of calling fetchDataCityName again
      temps = {
        current: data.main.temp,
        feels: data.main.feels_like,
        min: data.main.temp_min,
        max: data.main.temp_max,
      };

      const formattedTime = formatTime(data.dt, data.timezone);

      resultCity.innerHTML = capitalizeFirstLetter(data.name);
      time.innerHTML = formattedTime;
      weather.innerHTML = capitalizeFirstLetter(data.weather[0].description);
      icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
      icon.alt = data.weather[0].description;
      windSpeed.innerHTML = `${data.wind.speed} m/s`;
      humidityMain.innerHTML = `${data.main.humidity}%`;

      displayTempUnit();
      changeBgClass(data.weather[0].id);
      fiveDayWeatherData();
      
      hideLoading();
      showResults();
    })
    .catch((err) => {
      console.error(err);
      hideLoading();
      alert("Unable to fetch weather data for your location.");
    });
}

function geoSuccess(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  fetchDataGeolocation(lat, lon);
}

function geoError(error) {
  console.log(error.message);
  hideLoading();
  alert("Unable to retrieve your location. Please search for a city manually.");
}

// Initialize geolocation on page load
if (navigator.geolocation) {
  showLoading();
  navigator.geolocation.getCurrentPosition(geoSuccess, geoError, {
    timeout: 10000,
    enableHighAccuracy: true
  });
} else {
  alert("Geolocation is not supported by this browser");
}

// ---CONVERT TEMPERATURE UNIT---
function displayTempUnit() {
  if (isCelsius) {
    resultTemp.innerHTML = `${temps.current.toFixed(0)}°C`;
    feelTemp.innerHTML = `${temps.feels.toFixed(0)}°C`;
    minTemp.innerHTML = `${temps.min.toFixed(0)}°C`;
    maxTemp.innerHTML = `${temps.max.toFixed(0)}°C`;
  } else {
    resultTemp.innerHTML = `${((temps.current * 9) / 5 + 32).toFixed(0)}°F`;
    feelTemp.innerHTML = `${((temps.feels * 9) / 5 + 32).toFixed(0)}°F`;
    minTemp.innerHTML = `${((temps.min * 9) / 5 + 32).toFixed(0)}°F`;
    maxTemp.innerHTML = `${((temps.max * 9) / 5 + 32).toFixed(0)}°F`;
  }
  
  // Update forecast temperatures
  updateForecastTemperatures();
}

function updateForecastTemperatures() {
  for (let i = 0; i < forecastTemps.length; i++) {
    const tempElement = document.getElementById(`day${i + 1}temp`);
    if (tempElement && forecastTemps[i] !== undefined) {
      const celsiusTemp = forecastTemps[i];
      if (isCelsius) {
        tempElement.innerHTML = `${celsiusTemp.toFixed(0)}°C`;
      } else {
        tempElement.innerHTML = `${((celsiusTemp * 9) / 5 + 32).toFixed(0)}°F`;
      }
    }
  }
}

toggleTempBtn.addEventListener("change", () => {
  isCelsius = !isCelsius;
  displayTempUnit();
});

// ---BACKGROUND CLASS CHANGES---
function changeBgClass(weatherId) {
  // Remove existing weather classes
  document.body.classList.remove('weather-clear', 'weather-clouds', 'weather-rain', 'weather-snow', 'weather-storm', 'weather-mist');
  
  if (weatherId >= 200 && weatherId <= 232) {
    // Thunderstorm
    document.body.classList.add('weather-storm');
  } else if (weatherId >= 300 && weatherId <= 531) {
    // Drizzle and Rain
    document.body.classList.add('weather-rain');
  } else if (weatherId >= 600 && weatherId <= 622) {
    // Snow
    document.body.classList.add('weather-snow');
  } else if (weatherId >= 700 && weatherId <= 781) {
    // Atmosphere (mist, smoke, haze, etc.)
    document.body.classList.add('weather-mist');
  } else if (weatherId === 800) {
    // Clear sky
    document.body.classList.add('weather-clear');
  } else if (weatherId >= 801 && weatherId <= 804) {
    // Clouds
    document.body.classList.add('weather-clouds');
  }
}

// ---EVENT LISTENERS---
cityInput.addEventListener("input", handleInputChange);
searchCityBtn.addEventListener("click", fetchDataCityName);
cityInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    fetchDataCityName();
  }
});

// Add smooth scrolling to results when they appear
function scrollToResults() {
  setTimeout(() => {
    allResults.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }, 300);
}

// Enhanced error handling
window.addEventListener('error', function(e) {
  console.error('Global error:', e.error);
  hideLoading();
});

// Add loading state to search button
searchCityBtn.addEventListener('click', function() {
  this.style.transform = 'scale(0.95)';
  setTimeout(() => {
    this.style.transform = 'scale(1)';
  }, 150);
});