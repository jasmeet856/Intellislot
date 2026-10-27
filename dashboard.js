
/* =========================================
   INTELLISLOT DASHBOARD JAVASCRIPT
   Weather Alerts + Events + Notifications
========================================= */

/* LOCATION */
const latitude = 30.7333;
const longitude = 76.7794;

const dateOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
};

/* =========================================
   CURRENT DATE
========================================= */

function loadCurrentDate() {
    const element = document.getElementById("currentDate");
    if (!element) return;

    element.textContent = new Date().toLocaleDateString(
        "en-IN",
        dateOptions
    );
}

/* =========================================
   LOAD CURRENT WEATHER
========================================= */

async function loadWeather() {
    try {
        const response = await fetch(
            `http://localhost:5000/api/weather?latitude=${latitude}&longitude=${longitude}`
        );

        if (!response.ok) {
            throw new Error("Weather API failed");
        }

        const data = await response.json();
        const current = data.current;

        if (!current) {
            throw new Error("Current weather data missing");
        }

        const temperature = document.getElementById("temperature");
        if (temperature) {
            temperature.textContent =
                Math.round(current.temperature_2m) + "°C";
        }

        const weatherTemp = document.getElementById("weatherTemp");
        if (weatherTemp) {
            weatherTemp.textContent =
                current.temperature_2m + "°C";
        }

        const humidity = document.getElementById("humidity");
        if (humidity) {
            humidity.textContent =
                current.relative_humidity_2m + "%";
        }

        const windSpeed = document.getElementById("windSpeed");
        if (windSpeed) {
            windSpeed.textContent =
                current.wind_speed_10m + " km/h";
        }

        const weatherStatus = document.getElementById("weatherStatus");
        if (weatherStatus) {
            weatherStatus.textContent = "Live weather data";
        }

        const rainProbability =
            document.getElementById("rainProbability");

        if (rainProbability) {
            if (
                data.hourly &&
                Array.isArray(data.hourly.precipitation_probability)
            ) {
                const hour = new Date().getHours();
                const probability =
                    data.hourly.precipitation_probability[hour];

                rainProbability.textContent =
                    probability == null ? "--" : probability + "%";
            } else {
                rainProbability.textContent = "--";
            }
        }

    } catch (error) {
        console.error("Weather error:", error);

        const status = document.getElementById("weatherStatus");
        if (status) {
            status.textContent = "Weather data unavailable";
        }
    }

    // Also load the daily forecast for upcoming events.
    loadEventWeatherForecast();
}

/* =========================================
   WEATHER FORECAST FOR UPCOMING EVENTS
   Uses Open-Meteo daily forecast API.
========================================= */

async function loadEventWeatherForecast() {
    const eventList = document.getElementById("upcomingEvents");
    if (!eventList) return;

    let forecastBox = document.getElementById("eventWeatherAlerts");

    if (!forecastBox) {
        forecastBox = document.createElement("section");
        forecastBox.id = "eventWeatherAlerts";
        forecastBox.style.cssText =
            "margin-top:18px;padding:15px;border-radius:10px;" +
            "border:1px solid #ddd;";

        forecastBox.innerHTML =
            "<h3>Weather Alerts for Upcoming Events</h3>" +
            "<p>Loading weather forecast...</p>";

        eventList.insertAdjacentElement("afterend", forecastBox);
    } else {
        forecastBox.innerHTML =
            "<h3>Weather Alerts for Upcoming Events</h3>" +
            "<p>Loading weather forecast...</p>";
    }

    try {
        const url =
            "https://api.open-meteo.com/v1/forecast" +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            "&daily=temperature_2m_max,temperature_2m_min," +
            "precipitation_probability_max,weather_code" +
            "&forecast_days=14&timezone=auto";

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Forecast API request failed");
        }

        const data = await response.json();

        if (!data.daily || !Array.isArray(data.daily.time)) {
            throw new Error("Forecast data unavailable");
        }

        const events = getUpcomingEvents();
        forecastBox.innerHTML = "";

        const heading = document.createElement("h3");
        heading.textContent = "Weather Alerts for Upcoming Events";
        forecastBox.appendChild(heading);

        if (events.length === 0) {
            const message = document.createElement("p");
            message.textContent =
                "Add an event in Calendar to see its available weather forecast.";
            forecastBox.appendChild(message);
            return;
        }

        let shown = 0;

        events.forEach(event => {
            const index = data.daily.time.indexOf(event.date);

            const eventCard = document.createElement("div");
            eventCard.style.cssText =
                "padding:12px;margin-top:10px;border-radius:8px;" +
                "background:rgba(128,128,128,0.08);";

            const title = document.createElement("strong");
            title.textContent = event.name || "Untitled Event";
            eventCard.appendChild(title);

            const dateText = document.createElement("p");
            dateText.textContent = "Date: " + event.date;
            eventCard.appendChild(dateText);

            if (index === -1) {
                const unavailable = document.createElement("p");
                unavailable.textContent =
                    "Forecast is not available for this event date.";
                eventCard.appendChild(unavailable);
                forecastBox.appendChild(eventCard);
                shown++;
                return;
            }

            const maxTemp = data.daily.temperature_2m_max[index];
            const minTemp = data.daily.temperature_2m_min[index];
            const rainChance =
                data.daily.precipitation_probability_max[index];
            const weatherCode = data.daily.weather_code[index];

            const temperatureText = document.createElement("p");
            temperatureText.textContent =
                "Temperature: " +
                (minTemp ?? "--") + "°C to " +
                (maxTemp ?? "--") + "°C";
            eventCard.appendChild(temperatureText);

            const rainText = document.createElement("p");
            rainText.textContent =
                "Maximum rain probability: " +
                (rainChance == null ? "Unavailable" : rainChance + "%");
            eventCard.appendChild(rainText);

            const condition = document.createElement("p");
            condition.textContent =
                "Expected condition: " + getWeatherDescription(weatherCode);
            eventCard.appendChild(condition);

            const alerts = [];

            if (rainChance != null && rainChance >= 50) {
                alerts.push("Rain may affect your event. Carry an umbrella.");
            }

            if (maxTemp != null && maxTemp >= 35) {
                alerts.push("High temperature expected. Stay hydrated.");
            }

            if (alerts.length > 0) {
                const alertText = document.createElement("p");
                alertText.textContent = "Weather Alert: " + alerts.join(" ");
                alertText.style.fontWeight = "bold";
                eventCard.appendChild(alertText);
            } else {
                const safeText = document.createElement("p");
                safeText.textContent =
                    "No rain or high-temperature alert based on these thresholds.";
                eventCard.appendChild(safeText);
            }

            forecastBox.appendChild(eventCard);
            shown++;
        });

        if (shown === 0) {
            const message = document.createElement("p");
            message.textContent = "No upcoming events found.";
            forecastBox.appendChild(message);
        }

    } catch (error) {
        console.error("Event weather forecast error:", error);

        forecastBox.innerHTML =
            "<h3>Weather Alerts for Upcoming Events</h3>" +
            "<p>Forecast unavailable right now. Please check your internet connection and try again.</p>";
    }
}

/* Convert weather codes to readable conditions. */

function getWeatherDescription(code) {
    const descriptions = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        71: "Slight snow",
        73: "Moderate snow",
        75: "Heavy snow",
        80: "Rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        95: "Thunderstorm",
        96: "Thunderstorm with hail",
        99: "Thunderstorm with heavy hail"
    };

    return descriptions[code] || "Condition unavailable";
}

/* =========================================
   LOAD AIR QUALITY
========================================= */

async function loadAirQuality() {
    try {
        const response = await fetch(
            `http://localhost:5000/api/air-quality?latitude=${latitude}&longitude=${longitude}`
        );

        if (!response.ok) {
            throw new Error("Air Quality API failed");
        }

        const data = await response.json();
        const current = data.current || {};
        const aqi = current.european_aqi;

        const aqiValue = document.getElementById("aqiValue");
        if (aqiValue) {
            aqiValue.textContent = aqi ?? "--";
        }

        const aqiStatus = document.getElementById("aqiStatus");
        if (aqiStatus) {
            if (aqi == null) {
                aqiStatus.textContent = "AQI data unavailable";
            } else if (aqi <= 20) {
                aqiStatus.textContent = "Good";
            } else if (aqi <= 40) {
                aqiStatus.textContent = "Fair";
            } else if (aqi <= 60) {
                aqiStatus.textContent = "Moderate";
            } else if (aqi <= 80) {
                aqiStatus.textContent = "Poor";
            } else if (aqi <= 100) {
                aqiStatus.textContent = "Very Poor";
            } else {
                aqiStatus.textContent = "Extremely Poor";
            }
        }
        checkAQIAlerts();
    } 
    catch (error) {
        console.error("Air Quality error:", error);

        const aqiStatus = document.getElementById("aqiStatus");
        if (aqiStatus) {
            aqiStatus.textContent = "AQI data unavailable";
        }
    }
}

/* =========================================
   GET UPCOMING EVENTS
========================================= */

function getSavedEvents() {
    try {
        const events = JSON.parse(
            localStorage.getItem("intelliSlotEvents") || "[]"
        );

        return Array.isArray(events) ? events : [];
    } catch (error) {
        console.error("Could not read saved events:", error);
        return [];
    }
}

function getUpcomingEvents() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return getSavedEvents().filter(event => {
        if (!event.date) return false;

        const eventDate = new Date(event.date + "T00:00:00");
        if (Number.isNaN(eventDate.getTime())) return false;

        const daysFromNow = Math.round(
            (eventDate.getTime() - today.getTime()) / 86400000
        );

        return daysFromNow >= 0 && daysFromNow <= 14;
    });
}

/* =========================================
   DISPLAY UPCOMING EVENTS
========================================= */

function loadUpcomingEventList() {
    const eventList = document.getElementById("upcomingEvents");
    if (!eventList) return;

    const events = getUpcomingEvents().sort((a, b) => {
        const dateDifference = a.date.localeCompare(b.date);

        if (dateDifference !== 0) return dateDifference;

        return (a.time || "").localeCompare(b.time || "");
    });

    eventList.innerHTML = "";

    if (events.length === 0) {
        const message = document.createElement("p");
        message.textContent =
            "No upcoming events in the next 14 days. Add an event in Calendar.";
        eventList.appendChild(message);
        return;
    }

    events.forEach(event => {
        const eventItem = document.createElement("div");
        eventItem.className = "event";

        const dateBox = document.createElement("div");
        dateBox.className = "event-date";

        const parts = event.date.split("-").map(Number);
        const eventDate = new Date(parts[0], parts[1] - 1, parts[2]);

        const day = document.createElement("span");
        day.textContent = eventDate.getDate();

        const month = document.createElement("small");
        month.textContent = eventDate
            .toLocaleDateString("en-IN", { month: "short" })
            .toUpperCase();

        dateBox.append(day, month);

        const details = document.createElement("div");

        const title = document.createElement("strong");
        title.textContent = event.name || "Untitled Event";

        const info = document.createElement("p");
        info.textContent =
            (event.time || "Time not specified") +
            (event.location ? " • " + event.location : "");

        details.append(title, info);

        if (event.type) {
            const type = document.createElement("small");
            type.textContent = event.type;
            details.appendChild(type);
        }

        eventItem.append(dateBox, details);
        eventList.appendChild(eventItem);
    });
}

/* =========================================
   EVENT COUNT
========================================= */

function loadEvents() {
    const eventCount = document.getElementById("eventCount");

    if (eventCount) {
        eventCount.textContent = getUpcomingEvents().length;
    }
}

/* =========================================
   NOTIFICATION COUNT
========================================= */

function createNotificationId(event) {
    return (
        (event.name || "") + "_" +
        (event.date || "") + "_" +
        (event.time || "")
    ).replace(/\s+/g, "_").toLowerCase();
}

function loadNotificationCount() {
    const notificationCount =
        document.getElementById("notificationCount");

    const headerNotificationCount =
        document.getElementById("headerNotificationCount");

    const readNotifications = JSON.parse(
        localStorage.getItem("intelliSlotReadNotifications") || "[]"
    );

    const dismissedNotifications = JSON.parse(
        localStorage.getItem("intelliSlotDismissedNotifications") || "[]"
    );

    const events = getSavedEvents();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let unreadCount = 0;

    events.forEach(event => {
        if (!event.date) return;

        const eventDate = new Date(event.date + "T00:00:00");
        if (Number.isNaN(eventDate.getTime())) return;

        const daysFromNow = Math.round(
            (eventDate.getTime() - today.getTime()) / 86400000
        );

        const id = createNotificationId(event);

        if (
            daysFromNow >= 0 &&
            daysFromNow <= 14 &&
            !readNotifications.includes(id) &&
            !dismissedNotifications.includes(id)
        ) {
            unreadCount++;
        }
    });

    if (notificationCount) {
        notificationCount.textContent = unreadCount;
    }

    if (headerNotificationCount) {
        headerNotificationCount.textContent = unreadCount;
    }
}

/* =========================================
   REFRESH DASHBOARD
========================================= */

function refreshDashboard() {
    loadCurrentDate();
    loadWeather();
    loadAirQuality();
    loadEvents();
    loadUpcomingEventList();
    loadNotificationCount();
}

/* =========================================
   INITIAL LOAD AND AUTO REFRESH
========================================= */

refreshDashboard();

setInterval(refreshDashboard, 60000);

/* Update when local storage changes in another tab. */

window.addEventListener("storage", function (event) {
    if (
        !event.key ||
        event.key === "intelliSlotEvents" ||
        event.key === "intelliSlotReadNotifications" ||
        event.key === "intelliSlotDismissedNotifications"
    ) {
        loadEvents();
        loadUpcomingEventList();
        loadNotificationCount();
        loadEventWeatherForecast();
    }

    if (event.key === "intelliSlotTheme") {
        applySavedTheme();
    }
});

/* =========================================
   SETTINGS NAVIGATION
========================================= */

function openSettings() {
    window.location.href = "settings.html";
}

/* =========================================
   APPLY SAVED THEME
========================================= */

function applySavedTheme() {
    const savedTheme =
        localStorage.getItem("intelliSlotTheme") || "light";

    document.body.classList.toggle(
        "dark-theme",
        savedTheme === "dark"
    );
}

applySavedTheme();

/* =========================================
   BROWSER NOTIFICATIONS AND SOUND
========================================= */

(function () {
    const enableButton =
        document.getElementById("enableNotifications");

    const statusText =
        document.getElementById("notificationStatus");

    function updateStatus() {
        if (!enableButton || !statusText) return;

        if (!("Notification" in window)) {
            statusText.textContent =
                "Your browser does not support notifications.";
            enableButton.disabled = true;
            return;
        }

        statusText.textContent =
            Notification.permission === "granted"
                ? "Browser notifications are enabled."
                : "Click the button to enable notifications.";
    }

    function playNotificationSound() {
        try {
            const AudioContext =
                window.AudioContext || window.webkitAudioContext;

            if (!AudioContext) return;

            const audio = new AudioContext();
            const oscillator = audio.createOscillator();
            const gain = audio.createGain();

            oscillator.connect(gain);
            gain.connect(audio.destination);

            oscillator.frequency.value = 800;
            gain.gain.value = 0.12;

            oscillator.start();

            setTimeout(() => {
                oscillator.stop();
                audio.close();
            }, 250);
        } catch (error) {
            console.log("Notification sound unavailable.");
        }
    }

    function checkEventReminders() {
        if (!("Notification" in window)) return;
        if (Notification.permission !== "granted") return;

        const events = getSavedEvents();

        const now = new Date();
        const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );

        events.forEach(event => {
            if (!event.name || !event.date) return;

            const parts = event.date.split("-").map(Number);
            if (parts.length !== 3 || parts.some(Number.isNaN)) return;

            const eventDate = new Date(
                parts[0],
                parts[1] - 1,
                parts[2]
            );

            const daysLeft = Math.round(
                (eventDate.getTime() - today.getTime()) / 86400000
            );

            if (daysLeft !== 1 && daysLeft !== 0) return;

            const reminderKey =
                "intelliSlotReminder_" +
                event.name + "_" + event.date + "_" + daysLeft;

            if (localStorage.getItem(reminderKey)) return;

            const message = daysLeft === 0
                ? "Your event is today!"
                : "Your event is tomorrow!";

            try {
                new Notification("IntelliSlot Reminder", {
                    body: event.name + " — " + message,
                    tag: reminderKey
                });

                playNotificationSound();
                localStorage.setItem(reminderKey, "sent");
            } catch (error) {
                console.log("Could not show notification:", error);
            }
        });
    }

    if (enableButton && statusText) {
        enableButton.addEventListener("click", async function () {
            if (!("Notification" in window)) {
                updateStatus();
                return;
            }

            try {
                const permission =
                    await Notification.requestPermission();

                updateStatus();

                if (permission === "granted") {
                    playNotificationSound();

                    new Notification("IntelliSlot", {
                        body: "Notifications are enabled successfully!"
                    });

                    checkEventReminders();
                }
            } catch (error) {
                statusText.textContent =
                    "Could not enable notifications. Check browser settings.";
            }
        });

        updateStatus();
    }

    checkEventReminders();

    // Check reminders while the Dashboard is open.
    setInterval(checkEventReminders, 60000);

    document.addEventListener("visibilitychange", function () {
        if (!document.hidden) {
            checkEventReminders();
        }
    });
})();

/* ===== INTELLISLOT AQI ALERTS ===== */

function checkAQIAlerts() {
    const aqiElement = document.getElementById("aqiValue");
    const statusElement = document.getElementById("aqiStatus");

    if (!aqiElement || !statusElement) return;

    const aqi = Number(aqiElement.textContent);

    // AQI value available na ho to alert mat dikhao
    if (!Number.isFinite(aqi) || aqi < 0) return;

    let message = "";
    let level = "";

    if (aqi <= 20) {
        level = "Good";
        message = "Air quality is good. Enjoy outdoor activities!";
    } else if (aqi <= 40) {
        level = "Fair";
        message = "Air quality is fair. Most people can continue normal activities.";
    } else if (aqi <= 60) {
        level = "Moderate";
        message = "Air quality is moderate. Sensitive people should be cautious.";
    } else if (aqi <= 80) {
        level = "Poor";
        message = "Air quality is poor. Reduce prolonged outdoor activity.";
    } else if (aqi <= 100) {
        level = "Very Poor";
        message = "Air quality is very poor. Limit outdoor exposure.";
    } else {
        level = "Extremely Poor";
        message = "Air quality is extremely poor. Avoid strenuous outdoor activity.";
    }

    // Dashboard par current AQI status update karo
    statusElement.textContent = level;

    // Alert box create karo, agar pehle se nahi hai
    let alertBox = document.getElementById("aqiAlertBox");

    if (!alertBox) {
        alertBox = document.createElement("div");
        alertBox.id = "aqiAlertBox";

        const aqiCard = aqiElement.parentElement;
        if (aqiCard) {
            aqiCard.appendChild(alertBox);
        }
    }

    alertBox.textContent = message;
    alertBox.style.padding = "10px";
    alertBox.style.marginTop = "10px";
    alertBox.style.borderRadius = "8px";
    alertBox.style.fontSize = "14px";

    if (aqi > 60) {
        alertBox.style.backgroundColor = "#fee2e2";
        alertBox.style.color = "#991b1b";
    } else {
        alertBox.style.backgroundColor = "#dcfce7";
        alertBox.style.color = "#166534";
    }

    // Har AQI level par baar-baar browser notification na bhejo
    const previousLevel = sessionStorage.getItem("intelliSlotAQILevel");

    if (aqi > 60 && previousLevel !== level) {
        if ("Notification" in window &&
            Notification.permission === "granted") {
            new Notification("IntelliSlot - Air Quality Alert", {
                body: `AQI: ${aqi} (${level}). ${message}`
            });
        }
    }

    sessionStorage.setItem("intelliSlotAQILevel", level);
}
async function loadUnreadCount() {
    try {
        const response = await fetch(
            "http://localhost:5000/api/notifications"
        );

        if (!response.ok) {
            throw new Error("Failed to load notifications");
        }

        const notifications = await response.json();

        const unread = notifications.filter(notification =>
            Number(notification.is_read) === 0 ||
            notification.is_read === false
        ).length;

        const countElement = document.getElementById("unreadCount");

        if (countElement) {
            countElement.textContent = unread;
        }
    } catch (error) {
        console.error("Unread count error:", error);
    }
}

loadUnreadCount();
setInterval(loadUnreadCount, 30000);

async function loadUnreadCount() {
    try {
        const response = await fetch(
            "http://localhost:5000/api/notifications"
        );

        if (!response.ok) {
            throw new Error("Notifications load nahi hui");
        }

        const notifications = await response.json();

        const unread = notifications.filter(notification =>
            Number(notification.is_read) === 0 ||
            notification.is_read === false
        ).length;

        const countElement = document.getElementById("unreadCount");

        if (countElement) {
            countElement.textContent = unread;
        }

    } catch (error) {
        console.error("Unread count error:", error);
    }
}

loadUnreadCount();
setInterval(loadUnreadCount, 30000);
