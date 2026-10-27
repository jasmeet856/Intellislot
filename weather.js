const cityInput = document.getElementById("cityInput");

const searchWeatherBtn =
    document.getElementById("searchWeatherBtn");

const refreshWeatherBtn =
    document.getElementById("refreshWeatherBtn");

const weatherLoading =
    document.getElementById("weatherLoading");

const weatherError =
    document.getElementById("weatherError");

const weatherContent =
    document.getElementById("weatherContent");

const locationName =
    document.getElementById("locationName");

const temperature =
    document.getElementById("temperature");

const weatherDescription =
    document.getElementById("weatherDescription");

const weatherIcon =
    document.getElementById("weatherIcon");

const humidity =
    document.getElementById("humidity");

const windSpeed =
    document.getElementById("windSpeed");

const feelsLike =
    document.getElementById("feelsLike");

const weatherCode =
    document.getElementById("weatherCode");

const updatedTime =
    document.getElementById("updatedTime");


/* Weather Code */

function getWeatherInfo(code) {

    if (code === 0) {
        return {
            description: "Clear Sky",
            icon: "☀️"
        };
    }

    if (code >= 1 && code <= 3) {
        return {
            description: "Partly Cloudy",
            icon: "🌤️"
        };
    }

    if (code === 45 || code === 48) {
        return {
            description: "Foggy",
            icon: "🌫️"
        };
    }

    if (code >= 51 && code <= 57) {
        return {
            description: "Drizzle",
            icon: "🌦️"
        };
    }

    if (code >= 61 && code <= 67) {
        return {
            description: "Rain",
            icon: "🌧️"
        };
    }

    if (code >= 71 && code <= 77) {
        return {
            description: "Snow",
            icon: "❄️"
        };
    }

    if (code >= 80 && code <= 82) {
        return {
            description: "Rain Showers",
            icon: "🌦️"
        };
    }

    if (code >= 95) {
        return {
            description: "Thunderstorm",
            icon: "⛈️"
        };
    }

    return {
        description: "Unknown Weather",
        icon: "🌤️"
    };
}


/* Show Loading */

function showLoading() {

    weatherLoading.style.display = "block";

    weatherContent.style.display = "none";

    weatherError.style.display = "none";

}


/* Show Error */

function showError(message) {

    weatherLoading.style.display = "none";

    weatherContent.style.display = "none";

    weatherError.style.display = "block";

    weatherError.textContent = message;

}


/* Load Weather */

async function loadWeather(city) {

    if (!city) {

        showError("Please enter a city name.");

        return;

    }


    showLoading();


    try {

        /* Geocoding API */

        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;


        const geoResponse =
            await fetch(geoURL);


        if (!geoResponse.ok) {

            throw new Error(
                "Unable to find city."
            );

        }


        const geoData =
            await geoResponse.json();


        if (
            !geoData.results ||
            geoData.results.length === 0
        ) {

            throw new Error(
                "City not found. Please enter a valid city."
            );

        }


        const place =
            geoData.results[0];


        const latitude =
            place.latitude;

        const longitude =
            place.longitude;


        /* Weather API */

        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;


        const weatherResponse =
            await fetch(weatherURL);


        if (!weatherResponse.ok) {

            throw new Error(
                "Unable to load weather data."
            );

        }


        const weatherData =
            await weatherResponse.json();


        const current =
            weatherData.current;


        const weatherInfo =
            getWeatherInfo(
                current.weather_code
            );


        /* Update UI */

        let displayLocation =
            place.name;


        if (place.country) {

            displayLocation +=
                ", " + place.country;

        }


        locationName.textContent =
            displayLocation;


        temperature.textContent =
            `${Math.round(current.temperature_2m)}°C`;


        weatherDescription.textContent =
            weatherInfo.description;


        weatherIcon.textContent =
            weatherInfo.icon;


        humidity.textContent =
            `${current.relative_humidity_2m}%`;


        windSpeed.textContent =
            `${Math.round(current.wind_speed_10m)} km/h`;


        feelsLike.textContent =
            `${Math.round(current.apparent_temperature)}°C`;


        weatherCode.textContent =
            current.weather_code;


        updatedTime.textContent =
            new Date().toLocaleTimeString();


        /* Show Content */

        weatherLoading.style.display =
            "none";

        weatherError.style.display =
            "none";

        weatherContent.style.display =
            "block";


    } catch (error) {

        console.error(
            "Weather Error:",
            error
        );

        showError(
            error.message ||
            "Unable to load weather data."
        );

    }

}


/* Search */

if (searchWeatherBtn) {

    searchWeatherBtn.addEventListener(
        "click",
        () => {

            loadWeather(
                cityInput.value.trim()
            );

        }
    );

}


/* Enter Key */

if (cityInput) {

    cityInput.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {

                loadWeather(
                    cityInput.value.trim()
                );

            }

        }
    );

}


/* Refresh */

if (refreshWeatherBtn) {

    refreshWeatherBtn.addEventListener(
        "click",
        () => {

            loadWeather(
                cityInput.value.trim()
            );

        }
    );

}


/* Initial Weather */

loadWeather("Ludhiana");