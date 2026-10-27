document.addEventListener("DOMContentLoaded", function () {

    // Profile elements
    const profileForm = document.getElementById("profileForm");
    const userName = document.getElementById("userName");
    const userEmail = document.getElementById("userEmail");
    const profileMessage = document.getElementById("profileMessage");

    // Theme elements
    const themeSelect = document.getElementById("themeSelect");
    const saveTheme = document.getElementById("saveTheme");
    const themeMessage = document.getElementById("themeMessage");

    // Notification elements
    const eventReminders = document.getElementById("eventReminders");
    const weatherUpdates = document.getElementById("weatherUpdates");
    const saveNotifications = document.getElementById("saveNotifications");
    const notificationMessage = document.getElementById("notificationMessage");

    // Reset button
    const resetSettings = document.getElementById("resetSettings");

    // Load profile information
    function loadProfile() {
        if (userName) {
            userName.value =
                localStorage.getItem("intelliSlotUserName") || "";
        }

        if (userEmail) {
            userEmail.value =
                localStorage.getItem("intelliSlotUserEmail") || "";
        }
    }

    // Save profile information
    if (profileForm) {
        profileForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const name = userName.value.trim();
            const email = userEmail.value.trim();

            if (!name) {
                profileMessage.textContent = "Please enter your name.";
                return;
            }

            localStorage.setItem("intelliSlotUserName", name);
            localStorage.setItem("intelliSlotUserEmail", email);

            profileMessage.textContent =
                "Profile saved successfully!";
        });
    }

    // Apply selected theme
    function applyTheme(theme) {
        document.body.classList.toggle(
            "dark-theme",
            theme === "dark"
        );

        if (themeSelect) {
            themeSelect.value = theme;
        }
    }

    // Load saved theme
    const savedTheme =
        localStorage.getItem("intelliSlotTheme") || "light";

    applyTheme(savedTheme);

    // Save theme
    if (saveTheme) {
        saveTheme.addEventListener("click", function () {
            const theme = themeSelect.value;

            localStorage.setItem("intelliSlotTheme", theme);
            applyTheme(theme);

            themeMessage.textContent =
                "Theme applied successfully!";
        });
    }

    // Load notification preferences
    function loadNotificationPreferences() {
        if (eventReminders) {
            eventReminders.checked =
                localStorage.getItem("intelliSlotEventReminders") !== "false";
        }

        if (weatherUpdates) {
            weatherUpdates.checked =
                localStorage.getItem("intelliSlotWeatherUpdates") !== "false";
        }
    }

    // Save notification preferences
    if (saveNotifications) {
        saveNotifications.addEventListener("click", function () {

            localStorage.setItem(
                "intelliSlotEventReminders",
                eventReminders.checked
            );

            localStorage.setItem(
                "intelliSlotWeatherUpdates",
                weatherUpdates.checked
            );

            notificationMessage.textContent =
                "Notification preferences saved successfully!";
        });
    }

    // Reset settings
    if (resetSettings) {
        resetSettings.addEventListener("click", function () {

            const confirmReset = confirm(
                "Are you sure you want to reset all settings?"
            );

            if (!confirmReset) return;

            const keys = [
                "intelliSlotUserName",
                "intelliSlotUserEmail",
                "intelliSlotTheme",
                "intelliSlotEventReminders",
                "intelliSlotWeatherUpdates"
            ];

            keys.forEach(function (key) {
                localStorage.removeItem(key);
            });

            loadProfile();
            loadNotificationPreferences();
            localStorage.setItem("intelliSlotTheme", "light");
applyTheme("light");

            if (profileMessage) profileMessage.textContent = "";
            if (themeMessage) themeMessage.textContent = "";
            if (notificationMessage) {
                notificationMessage.textContent = "";
            }

            alert("Settings reset successfully!");
        });
    }

    // Initialize settings
    loadProfile();
    loadNotificationPreferences();

});