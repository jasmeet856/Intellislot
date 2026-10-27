const airCityInput =
    document.getElementById("airCityInput");

const searchAirBtn =
    document.getElementById("searchAirBtn");

const refreshAirBtn =
    document.getElementById("refreshAirBtn");

const airLoading =
    document.getElementById("airLoading");

const airError =
    document.getElementById("airError");

const airContent =
    document.getElementById("airContent");

const airLocation =
    document.getElementById("airLocation");

const aqiValue =
    document.getElementById("aqiValue");

const aqiStatus =
    document.getElementById("aqiStatus");

const aqiIcon =
    document.getElementById("aqiIcon");

const pm25 =
    document.getElementById("pm25");

const pm10 =
    document.getElementById("pm10");

const co =
    document.getElementById("co");

const no2 =
    document.getElementById("no2");

const o3 =
    document.getElementById("o3");

const so2 =
    document.getElementById("so2");

const airUpdatedTime =
    document.getElementById("airUpdatedTime");


/* AQI Information */

function getAQIInfo(aqi) {

    if (aqi <= 50) {

        return {
            status: "Good",
            className: "aqi-good",
            icon: "😊"
        };

    }

    if (aqi <= 100) {

        return {
            status: "Moderate",
            className: "aqi-moderate",
            icon: "🙂"
        };

    }

    if (aqi <= 150) {

        return {
            status: "Unhealthy",
            className: "aqi-unhealthy",
            icon: "😷"
        };

    }

    return {
        status: "Poor",
        className: "aqi-poor",
        icon: "⚠️"
    };

}


/* Loading */

function showAirLoading() {

    airLoading.style.display = "block";

    airContent.style.display = "none";

    airError.style.display = "none";

}


/* Error */

function showAirError(message) {

    airLoading.style.display = "none";

    airContent.style.display = "none";

    airError.style.display = "block";

    airError.textContent = message;

}


/* Load Air Quality */

async function loadAirQuality(city) {

    if (!city) {

        showAirError(
            "Please enter a city name."
        );

        return;

    }


    showAirLoading();


    try {

        /* Find City */

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


        /* Air Quality API */

        const airURL =
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone,sulphur_dioxide,us_aqi&timezone=auto`;


        const airResponse =
            await fetch(airURL);


        if (!airResponse.ok) {

            throw new Error(
                "Unable to load air quality data."
            );

        }


        const airData =
            await airResponse.json();


        const current =
            airData.current;


        /* AQI */

        const aqi =
            Math.round(current.us_aqi);


        const aqiInfo =
            getAQIInfo(aqi);


        /* Location */

        let displayLocation =
            place.name;


        if (place.country) {

            displayLocation +=
                ", " + place.country;

        }


        airLocation.textContent =
            displayLocation;


        /* AQI */

        aqiValue.textContent =
            aqi;


        aqiStatus.textContent =
            aqiInfo.status;


        aqiStatus.className =
            "aqi-status " +
            aqiInfo.className;


        aqiIcon.textContent =
            aqiInfo.icon;


        /* Pollutants */

        pm25.textContent =
            `${Math.round(current.pm2_5)} μg/m³`;


        pm10.textContent =
            `${Math.round(current.pm10)} μg/m³`;


        co.textContent =
            `${Math.round(current.carbon_monoxide)} μg/m³`;


        no2.textContent =
            `${Math.round(current.nitrogen_dioxide)} μg/m³`;


        o3.textContent =
            `${Math.round(current.ozone)} μg/m³`;


        so2.textContent =
            `${Math.round(current.sulphur_dioxide)} μg/m³`;


        airUpdatedTime.textContent =
            new Date().toLocaleTimeString();


        /* Show Content */

        airLoading.style.display =
            "none";

        airError.style.display =
            "none";

        airContent.style.display =
            "block";


    } catch (error) {

        console.error(
            "Air Quality Error:",
            error
        );

        showAirError(
            error.message ||
            "Unable to load air quality data."
        );

    }

}


/* Search Button */

if (searchAirBtn) {

    searchAirBtn.addEventListener(
        "click",
        () => {

            loadAirQuality(
                airCityInput.value.trim()
            );

        }
    );

}


/* Enter Key */

if (airCityInput) {

    airCityInput.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {

                loadAirQuality(
                    airCityInput.value.trim()
                );

            }

        }
    );

}


/* Refresh */

if (refreshAirBtn) {

    refreshAirBtn.addEventListener(
        "click",
        () => {

            loadAirQuality(
                airCityInput.value.trim()
            );

        }
    );

}


/* Initial Load */

loadAirQuality("Ludhiana");