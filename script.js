// ---GET ELEMENTS FROM HTML---
let cityInput = document.getElementById("cityInputField");
let searchCityBtn = document.getElementById("citySearchBtn");
let resultCity = document.getElementById("resCity");
let resultTemp = document.getElementById("currentTemp");
let time=document.getElementById("time");
let minTemp = document.getElementById("minTemp");
let maxTemp = document.getElementById("maxTemp");
let feelTemp = document.getElementById("feelTemp");
let weather = document.getElementById("resWeather");
let windSpeed = document.getElementById("resWindSpeed");
let windDeg = document.getElementById("resWindDeg");
let toggleTempBtn = document.getElementById("tempToggle");
let allResults= document.getElementById("allResults");
let iconMain = document.getElementById("iconMain");
let icon = document.getElementById("icon");
let humidityMain = document.getElementById("humidity");
let day1temp = document.getElementById("day1temp");


let cityName = "";
let temps = {};
let isCelsius = true;
let apiKey = "808910939ecd307e83962c1c171b7b11";

// ---GET DATA FROM APIs ---
function handleInputChange(e) {
  cityName = e.target.value;
}

function fetchDataCityName() {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      temps = {
        current: data.main.temp,
        feels: data.main.feels_like,
        min: data.main.temp_min,
        max: data.main.temp_max,
      };
      const { dt, timezone } = data;

      const localTime = new Date((dt + timezone) * 1000);

     
      const options = { timeZone: "UTC", hour12: false }; 
      const formattedTime = localTime.toLocaleString("en-US", options);

  
      console.log(data.weather[0].id);

      resultCity.innerHTML =
        cityName.charAt(0).toUpperCase() + cityName.slice(1);
        time.innerHTML= formattedTime;
      weather.innerHTML = `${data.weather[0].main}`;
      icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
      windSpeed.innerHTML = `Wind speed: ${data.wind.speed} m/s`;
      windDeg.innerHTML = `Wind direction: ${data.wind.deg}°`;
      humidityMain.innerHTML = `<img src="./images/water_drop_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg">${data.main.humidity}`;
      allResults.style.display ="grid";

      displayTempUnit();
      changeBgImg(data.weather[0].id);
      fiveDayWeatherData();
    })

    .catch((err) => {
      console.log(err);
      alert("Check if you entered your city correctly");
    });
}

function fiveDayWeatherData() {
  fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      const days = data.list.filter((item) => item.dt_txt.includes("12:00:00"));

      for (let i = 0; i < 5; i++) {
        const dayData = days[i];
        const dayTemp = dayData.main.temp;
        const icon = dayData.weather[0].icon;
        const dayName = new Date(dayData.dt * 1000).toLocaleString("en-US", {
          weekday: "long",
        }); //I took this from chatgpt.....
        const dayWeather = dayData.weather[0].description;

        document.getElementById(
          `day${i + 1}temp`
        ).innerHTML = `${dayTemp.toFixed(1)} °C`;
        document.getElementById(`day${i + 1}name`).innerHTML = dayName;
        document.getElementById(`day${i + 1}weather`).innerHTML = dayWeather;
        document.getElementById(
          `icon${i + 1}day`
        ).src = `https://openweathermap.org/img/wn/${icon}.png`;
      }
    })
    .catch((err) => {
      console.log(err);
      alert("Check if you entered your city correctly");
    });
}

// ---GEOLOCATION---
function fetchDataGeolocation(lat, lon) {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      cityName = data.name;
      fetchDataCityName();
    })
    .catch((err) => {
      console.log(err);
      alert("Unable to fetch weather data for the location.");
    });
}

function geoSuccess(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  fetchDataGeolocation(lat, lon);
}

function geoError(error) {
  console.log(error.message);
  alert("Unable to retrieve location...");
}

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
} else {
  alert("Geolocation is not supported");
}

// ---CONVERT TEMPERATURE UNIT---
function displayTempUnit() {
  if (isCelsius) {
    resultTemp.innerHTML = `${temps.current.toFixed(0)} °C`;
    feelTemp.innerHTML = `Feels like ${temps.feels.toFixed(1)} °C`;
    minTemp.innerHTML = `Min temperature: ${temps.min.toFixed(1)} °C`;
    maxTemp.innerHTML = `Max temperature: ${temps.max.toFixed(1)} °C`;
    toggleTempBtn.innerHTML = "Switch to Fahrenheit";
  } else {
    resultTemp.innerHTML = `${((temps.current * 9) / 5 + 32).toFixed(1)} °F`;
    feelTemp.innerHTML = `Feels like ${((temps.feels * 9) / 5 + 32).toFixed(
      1
    )} °F`;
    minTemp.innerHTML = `Min temperature: ${((temps.min * 9) / 5 + 32).toFixed(
      1
    )} °F`;
    maxTemp.innerHTML = `Max temperature: ${((temps.max * 9) / 5 + 32).toFixed(
      1
    )} °F`;
    toggleTempBtn.innerHTML = "Switch to Celsius";
  }
}

toggleTempBtn.addEventListener("click", () => {
  isCelsius = !isCelsius;
  displayTempUnit();
});

// ---BACKGROUND IMAGE---
function changeBgImg(weatherId) {
  if (weatherId >= 200 && weatherId <= 232) {
    document.body.style.backgroundImage = "url('images/storm.jpg')";
  }else if (weatherId >= 300 && weatherId <= 531) {
      document.body.style.backgroundImage = "url('images/rain.jpg')";
  } else if (weatherId >= 600 && weatherId <= 622) {
    document.body.style.backgroundImage = "url('images/snow.jpg')";
  }else if (weatherId >= 700 && weatherId <= 781) {
    document.body.style.backgroundImage = "url('images/wind.jpg')";
  } else if (weatherId === 800) {
    document.body.style.backgroundImage = "url('images/clear.jpg')";
  } else if (weatherId >= 801 && weatherId <= 804) {
    document.body.style.backgroundImage = "url('images/clouds.jpg')";
  }
}
// ------------------

cityInput.addEventListener("input", handleInputChange);
searchCityBtn.addEventListener("click", fetchDataCityName);
cityInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    fetchDataCityName();
  }
});
