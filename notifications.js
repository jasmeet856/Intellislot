
/* =========================================
   INTELLISLOT NOTIFICATIONS
========================================= */

let events = JSON.parse(
    localStorage.getItem("intelliSlotEvents") || "[]"
);

let readNotifications = JSON.parse(
    localStorage.getItem("intelliSlotReadNotifications") || "[]"
);

let dismissedNotifications = JSON.parse(
    localStorage.getItem("intelliSlotDismissedNotifications") || "[]"
);

let databaseNotifications = [];

const notificationsList = document.getElementById("notificationsList");
const noNotifications = document.getElementById("noNotifications");
const totalNotifications = document.getElementById("totalNotifications");
const unreadNotifications = document.getElementById("unreadNotifications");
const todayNotifications = document.getElementById("todayNotifications");
const notificationSearch = document.getElementById("notificationSearch");
const notificationFilter = document.getElementById("notificationFilter");
const markAllReadBtn = document.getElementById("markAllReadBtn");

/* HELPERS */

function getToday() {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function getDaysRemaining(date) {
    const today = getToday();
    const eventDate = new Date(date + "T00:00:00");
    return Math.round((eventDate - today) / 86400000);
}

function formatDate(dateString) {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function getNotificationId(event) {
    return `${event.name}_${event.date}_${event.time}`
        .replace(/\s+/g, "_").toLowerCase();
}

function getEventIcon(event) {
    const type = (event.type || "").toLowerCase();

    if (type.includes("holiday") || type.includes("festival")) return "🎉";
    if (type.includes("campus") || type.includes("workshop")) return "🎓";
    if (type.includes("corporate") || type.includes("meeting")) return "🏢";

    return "🔔";
}

function getEventMessage(event) {
    const days = getDaysRemaining(event.date);

    if (days === 0) return `Your event "${event.name}" is today.`;
    if (days === 1) return `Your event "${event.name}" is tomorrow.`;

    return `Your event "${event.name}" is in ${days} days.`;
}

function isDatabaseRead(notification) {
    return Number(notification.is_read) === 1 ||
           notification.is_read === true;
}

/* LOAD NOTIFICATIONS FROM MYSQL */

async function loadDatabaseNotifications() {
    try {
        const response = await fetch(
            "http://localhost:5000/api/notifications"
        );

        if (!response.ok) {
            throw new Error("Could not load database notifications");
        }

        databaseNotifications = await response.json();
        displayNotifications();

    } catch (error) {
        console.error("Database notification error:", error);
    }
}

/* DISPLAY ALL NOTIFICATIONS */

function displayNotifications() {
    if (!notificationsList) return;

    events = JSON.parse(
        localStorage.getItem("intelliSlotEvents") || "[]"
    );

    const searchText = (notificationSearch.value || "")
        .toLowerCase().trim();

    const selectedFilter = notificationFilter.value || "all";
    const todayString = getToday().toDateString();

    const eventItems = events
        .map(event => ({
            ...event,
            id: getNotificationId(event),
            daysRemaining: getDaysRemaining(event.date)
        }))
        .filter(event =>
            event.daysRemaining >= 0 &&
            event.daysRemaining <= 14 &&
            !dismissedNotifications.includes(event.id)
        );

    const visibleEvents = eventItems.filter(event => {
        const isRead = readNotifications.includes(event.id);
        const matchesSearch = (event.name || "")
            .toLowerCase().includes(searchText);

        let matchesFilter = true;

        if (selectedFilter === "unread") matchesFilter = !isRead;
        if (selectedFilter === "today") matchesFilter = event.daysRemaining === 0;
        if (selectedFilter === "upcoming") matchesFilter = event.daysRemaining > 0;

        return matchesSearch && matchesFilter;
    });

    const visibleDatabase = databaseNotifications.filter(notification => {
        const title = notification.title || "";
        const message = notification.message || "";
        const isRead = isDatabaseRead(notification);

        const matchesSearch =
            title.toLowerCase().includes(searchText) ||
            message.toLowerCase().includes(searchText);

        const createdToday = notification.created_at &&
            new Date(notification.created_at).toDateString() === todayString;

        let matchesFilter = true;

        if (selectedFilter === "unread") matchesFilter = !isRead;
        if (selectedFilter === "today") matchesFilter = Boolean(createdToday);
        if (selectedFilter === "upcoming") {
            matchesFilter = notification.event_id != null;
        }

        return matchesSearch && matchesFilter;
    });

    notificationsList.innerHTML = "";

    /* LOCAL EVENT NOTIFICATIONS */

    visibleEvents.forEach(event => {
        const isRead = readNotifications.includes(event.id);
        const card = document.createElement("div");
        card.className = "notification-card";

        if (!isRead) card.classList.add("unread");

        const icon = document.createElement("div");
        icon.className = "notification-icon";
        icon.textContent = getEventIcon(event);

        const content = document.createElement("div");
        content.className = "notification-content";

        const title = document.createElement("h3");
        title.textContent = event.name || "Upcoming Event";

        const message = document.createElement("p");
        message.textContent = getEventMessage(event);

        const time = document.createElement("span");
        time.className = "notification-time";
        time.textContent =
            `📅 ${formatDate(event.date)} | ⏰ ${event.time || "Time not specified"} | 📍 ${event.location || "Location not specified"}`;

        content.append(title, message, time);

        const actions = document.createElement("div");
        actions.className = "notification-actions";

        const readButton = document.createElement("button");
        readButton.textContent = isRead ? "↩ Unread" : "✓ Read";
        readButton.addEventListener("click", () => {
            if (isRead) {
                markAsUnread(event.id);
            } else {
                markAsRead(event.id);
            }
        });

        const dismissButton = document.createElement("button");
        dismissButton.textContent = "✕";
        dismissButton.addEventListener("click", () => {
            dismissNotification(event.id);
        });

        actions.append(readButton, dismissButton);
        card.append(icon, content, actions);
        notificationsList.appendChild(card);
    });

    /* MYSQL NOTIFICATIONS */

    visibleDatabase.forEach(notification => {
        const isRead = isDatabaseRead(notification);

        const card = document.createElement("div");
        card.className = "notification-card";

        if (!isRead) card.classList.add("unread");

        const icon = document.createElement("div");
        icon.className = "notification-icon";
        icon.textContent = "🔔";

        const content = document.createElement("div");
        content.className = "notification-content";

        const title = document.createElement("h3");
        title.textContent = notification.title || "Notification";

        const message = document.createElement("p");
        message.textContent = notification.message || "";

        const time = document.createElement("span");
        time.className = "notification-time";
        time.textContent = notification.created_at
            ? new Date(notification.created_at).toLocaleString("en-IN")
            : "Recently created";

        const readButton = document.createElement("button");
        readButton.textContent = isRead ? "Read" : "✓ Mark as Read";
        readButton.disabled = isRead;

        readButton.addEventListener("click", () => {
            markDatabaseNotificationRead(notification.id);
        });

        content.append(title, message, time, readButton);
        card.append(icon, content);
        notificationsList.appendChild(card);
    });

    noNotifications.style.display =
        visibleEvents.length + visibleDatabase.length === 0
            ? "block" : "none";

    updateSummary(eventItems);
}

/* SUMMARY COUNTS */

function updateSummary(eventItems) {
    const dbUnread = databaseNotifications.filter(
        notification => !isDatabaseRead(notification)
    ).length;

    const eventUnread = eventItems.filter(
        event => !readNotifications.includes(event.id)
    ).length;

    const dbToday = databaseNotifications.filter(notification =>
        notification.created_at &&
        new Date(notification.created_at).toDateString() ===
        getToday().toDateString()
    ).length;

    const eventToday = eventItems.filter(
        event => event.daysRemaining === 0
    ).length;

    totalNotifications.textContent =
        eventItems.length + databaseNotifications.length;

    unreadNotifications.textContent = eventUnread + dbUnread;

    todayNotifications.textContent = eventToday + dbToday;
}

/* LOCAL STORAGE READ STATUS */

function markAsRead(id) {
    if (!readNotifications.includes(id)) {
        readNotifications.push(id);
    }

    localStorage.setItem(
        "intelliSlotReadNotifications",
        JSON.stringify(readNotifications)
    );

    displayNotifications();
}

function markAsUnread(id) {
    readNotifications = readNotifications.filter(item => item !== id);

    localStorage.setItem(
        "intelliSlotReadNotifications",
        JSON.stringify(readNotifications)
    );

    displayNotifications();
}

function dismissNotification(id) {
    if (!dismissedNotifications.includes(id)) {
        dismissedNotifications.push(id);
    }

    localStorage.setItem(
        "intelliSlotDismissedNotifications",
        JSON.stringify(dismissedNotifications)
    );

    displayNotifications();
}

/* MYSQL: MARK ONE AS READ */

async function markDatabaseNotificationRead(id) {
    try {
        const response = await fetch(
            `http://localhost:5000/api/notifications/${id}/read`,
            { method: "PUT" }
        );

        if (!response.ok) throw new Error("Update failed");

        await loadDatabaseNotifications();

    } catch (error) {
        console.error(error);
        alert("Notification update nahi hui. Backend check karo.");
    }
}

/* MARK ALL AS READ */

markAllReadBtn.addEventListener("click", async () => {
    // Mark local event reminders as read
    const eventItems = events
        .map(event => ({
            ...event,
            id: getNotificationId(event),
            daysRemaining: getDaysRemaining(event.date)
        }))
        .filter(event =>
            event.daysRemaining >= 0 &&
            event.daysRemaining <= 14 &&
            !dismissedNotifications.includes(event.id)
        );

    eventItems.forEach(event => {
        if (!readNotifications.includes(event.id)) {
            readNotifications.push(event.id);
        }
    });

    localStorage.setItem(
        "intelliSlotReadNotifications",
        JSON.stringify(readNotifications)
    );

    // Mark MySQL notifications as read
    try {
        const response = await fetch(
            "http://localhost:5000/api/notifications/read-all",
            { method: "PUT" }
        );

        if (!response.ok) throw new Error("Update all failed");

        await loadDatabaseNotifications();

    } catch (error) {
        console.error(error);
        alert("Database notifications update nahi hui.");
    }

    displayNotifications();
});

/* SEARCH AND FILTER */

notificationSearch.addEventListener("input", displayNotifications);
notificationFilter.addEventListener("change", displayNotifications);

/* REFRESH WHEN LOCAL STORAGE CHANGES */

window.addEventListener("storage", () => {
    events = JSON.parse(
        localStorage.getItem("intelliSlotEvents") || "[]"
    );

    displayNotifications();
});

/* INITIAL LOAD */

displayNotifications();
loadDatabaseNotifications();

console.log("IntelliSlot Notifications loaded!");
