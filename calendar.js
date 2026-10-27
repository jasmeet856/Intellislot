// ==========================================
// INTELLISLOT CALENDAR
// ==========================================

let currentDate = new Date();
let editingEventIndex = -1;


// ==========================================
// CALENDAR ELEMENTS
// ==========================================

const monthYear = document.getElementById("monthYear");
const calendarDays = document.getElementById("calendarDays");


// ==========================================
// DISPLAY CALENDAR
// ==========================================

function displayCalendar() {

    if (!monthYear || !calendarDays) {
        return;
    }

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay =
        new Date(year, month, 1).getDay();

    const totalDays =
        new Date(year, month + 1, 0).getDate();


    monthYear.textContent =
        currentDate.toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric"
        });


    calendarDays.innerHTML = "";


    // Empty boxes before first day
    for (let i = 0; i < firstDay; i++) {

        const emptyDay =
            document.createElement("div");

        emptyDay.classList.add("empty");

        calendarDays.appendChild(emptyDay);
    }


    // Calendar dates
    for (let day = 1; day <= totalDays; day++) {

        const dayBox =
            document.createElement("div");

        dayBox.textContent = day;


        const today = new Date();


        if (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        ) {

            dayBox.classList.add("today");

        }


        calendarDays.appendChild(dayBox);
    }
}


// ==========================================
// PREVIOUS MONTH
// ==========================================

const previousMonthBtn =
    document.getElementById("previousMonth");

if (previousMonthBtn) {

    previousMonthBtn.addEventListener(
        "click",
        () => {

            currentDate.setMonth(
                currentDate.getMonth() - 1
            );

            displayCalendar();

        }
    );
}


// ==========================================
// NEXT MONTH
// ==========================================

const nextMonthBtn =
    document.getElementById("nextMonth");

if (nextMonthBtn) {

    nextMonthBtn.addEventListener(
        "click",
        () => {

            currentDate.setMonth(
                currentDate.getMonth() + 1
            );

            displayCalendar();

        }
    );
}


// ==========================================
// EVENT MODAL
// ==========================================

const addEventBtn =
    document.getElementById("addEventBtn");

const eventModal =
    document.getElementById("eventModal");

const closeEventBtn =
    document.getElementById("closeEventBtn");


// Open Add Event modal
if (addEventBtn) {

    addEventBtn.addEventListener(
        "click",
        () => {

            editingEventIndex = -1;

            document.getElementById("eventName").value = "";
            document.getElementById("eventDate").value = "";
            document.getElementById("eventTime").value = "";
            document.getElementById("eventLocation").value = "";

            if (eventModal) {
                eventModal.classList.add("show");
            }

        }
    );
}


// Close modal
if (closeEventBtn) {

    closeEventBtn.addEventListener(
        "click",
        () => {

            if (eventModal) {
                eventModal.classList.remove("show");
            }

        }
    );
}


// Close modal by clicking outside
if (eventModal) {

    eventModal.addEventListener(
        "click",
        (event) => {

            if (event.target === eventModal) {

                eventModal.classList.remove("show");

            }

        }
    );
}


// ==========================================
// SAVE / UPDATE EVENT
// ==========================================


const saveEventBtn = document.getElementById("saveEventBtn");

if (saveEventBtn) {
    saveEventBtn.addEventListener("click", async () => {
        const eventName = document.getElementById("eventName").value.trim();
        const eventDate = document.getElementById("eventDate").value;
        const eventTime = document.getElementById("eventTime").value;
        const eventType = document.getElementById("eventType").value;
        const eventLocation = document.getElementById("eventLocation").value.trim();

        if (!eventName || !eventDate || !eventTime) {
            alert("Please enter event name, date and time.");
            return;
        }

        const eventData = {
            title: eventName,
            event_date: eventDate,
            event_time: eventTime,
            category: eventType,
            location: eventLocation
        };

        try {
            const events = JSON.parse(
                localStorage.getItem("intelliSlotEvents") || "[]"
            );

            const isEditing = editingEventIndex !== -1;
            const oldEvent = isEditing ? events[editingEventIndex] : null;

            if (isEditing && (!oldEvent || !oldEvent.id)) {
                alert("This event has no database ID. Please add it again.");
                return;
            }

            const response = await fetch(
                isEditing
                    ? `http://localhost:5000/api/events/${oldEvent.id}`
                    : "http://localhost:5000/api/events",
                {
                    method: isEditing ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(eventData)
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Could not save event");
            }

            if (isEditing) {
                events[editingEventIndex] = {
                    id: oldEvent.id,
                    name: eventName,
                    date: eventDate,
                    time: eventTime,
                    type: eventType,
                    location: eventLocation
                };
            } else {
                events.push({
                    id: result.id,
                    name: eventName,
                    date: eventDate,
                    time: eventTime,
                    type: eventType,
                    location: eventLocation
                });
            }

            localStorage.setItem("intelliSlotEvents", JSON.stringify(events));

            editingEventIndex = -1;
            displaySavedEvents();

            eventModal?.classList.remove("show");

            document.getElementById("eventName").value = "";
            document.getElementById("eventDate").value = "";
            document.getElementById("eventTime").value = "";
            document.getElementById("eventLocation").value = "";

            check14DayReminders();
            generateNotifications();

            alert(isEditing ? "Event updated successfully!" : "Event saved to database!");

        } catch (error) {
            console.error("Save event error:", error);
            alert("Could not save event. Check that the backend is running.");
        }
    });
}



// ==========================================
// DISPLAY SAVED EVENTS
// ==========================================

function displaySavedEvents() {

    const eventList =
        document.getElementById(
            "calendarEventList"
        );

    if (!eventList) {
        return;
    }


    let events =
        JSON.parse(
            localStorage.getItem(
                "intelliSlotEvents"
            )
        ) || [];


    eventList.innerHTML = "";


    if (events.length === 0) {

        eventList.innerHTML = `

            <div class="calendar-event-item">

                <span>📅</span>

                <div>

                    <strong>
                        No events added yet
                    </strong>

                    <p>
                        Add an event using the
                        + Add Event button.
                    </p>

                </div>

            </div>

        `;

        return;
    }


    events.forEach(
        (event, index) => {

            const eventItem =
                document.createElement("div");

            eventItem.classList.add(
                "calendar-event-item"
            );


            eventItem.innerHTML = `

                <span>📅</span>

                <div class="event-details">

                    <strong>
                        ${event.name}
                    </strong>

                    <p>
                        ${event.date}
                        •
                        ${event.time}

                        ${
                            event.location
                                ? " • " + event.location
                                : ""
                        }

                    </p>

                    <small>
                        ${event.type}
                    </small>

                    <div class="event-actions">

                        <button
                            class="edit-event-btn"
                            type="button"
                        >
                            ✏️ Edit
                        </button>

                        <button
                            class="delete-event-btn"
                            type="button"
                        >
                            🗑️ Delete
                        </button>

                    </div>

                </div>

            `;


            const editBtn =
                eventItem.querySelector(
                    ".edit-event-btn"
                );

            editBtn.addEventListener(
                "click",
                () => {

                    editEvent(index);

                }
            );


            const deleteBtn =
                eventItem.querySelector(
                    ".delete-event-btn"
                );

            deleteBtn.addEventListener(
                "click",
                () => {

                    deleteEvent(index);

                }
            );


            eventList.appendChild(
                eventItem
            );

        }
    );
}


// ==========================================
// EDIT EVENT
// ==========================================

function editEvent(index) {

    let events =
        JSON.parse(
            localStorage.getItem(
                "intelliSlotEvents"
            )
        ) || [];


    const event = events[index];

    if (!event) {
        return;
    }


    editingEventIndex = index;


    document.getElementById("eventName").value =
        event.name;

    document.getElementById("eventDate").value =
        event.date;

    document.getElementById("eventTime").value =
        event.time;

    document.getElementById("eventType").value =
        event.type;

    document.getElementById("eventLocation").value =
        event.location || "";


    if (eventModal) {

        eventModal.classList.add("show");

    }
}


// ==========================================
// DELETE EVENT
// ==========================================


async function deleteEvent(index) {
    const events = JSON.parse(
        localStorage.getItem("intelliSlotEvents") || "[]"
    );

    const event = events[index];

    if (!event) return;

    if (!confirm(`Are you sure you want to delete "${event.name}"?`)) {
        return;
    }

    if (!event.id) {
        alert("This event has no database ID. Please reload events.");
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:5000/api/events/${event.id}`,
            { method: "DELETE" }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Delete failed");
        }

        events.splice(index, 1);

        localStorage.setItem("intelliSlotEvents", JSON.stringify(events));

        displaySavedEvents();
        check14DayReminders();
        generateNotifications();

        alert("Event deleted successfully!");

    } catch (error) {
        console.error("Delete event error:", error);
        alert("Could not delete event. Check your backend.");
    }
}


// ==========================================
// SEARCH + FILTER
// ==========================================

function filterEvents() {

    const searchInput =
        document.getElementById(
            "eventSearch"
        );

    const filterInput =
        document.getElementById(
            "eventFilter"
        );


    if (!searchInput || !filterInput) {
        return;
    }


    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();


    const selectedType =
        filterInput.value;


    let events =
        JSON.parse(
            localStorage.getItem(
                "intelliSlotEvents"
            )
        ) || [];


    const filteredEvents =
        events.filter(
            (event) => {

                const eventName =
                    (event.name || "")
                        .toLowerCase();


                const eventLocation =
                    (event.location || "")
                        .toLowerCase();


                const matchesSearch =
                    eventName.includes(
                        searchText
                    ) ||
                    eventLocation.includes(
                        searchText
                    );


                const matchesFilter =
                    selectedType === "All" ||
                    event.type === selectedType;


                return (
                    matchesSearch &&
                    matchesFilter
                );

            }
        );


    displayFilteredEvents(
        filteredEvents
    );
}


// ==========================================
// DISPLAY FILTERED EVENTS
// ==========================================

function displayFilteredEvents(events) {

    const eventList =
        document.getElementById("calendarEventList");

    if (!eventList) {
        return;
    }

    eventList.innerHTML = "";

    if (events.length === 0) {

        eventList.innerHTML = `
            <div class="calendar-event-item">

                <span>🔍</span>

                <div>
                    <strong>No events found</strong>

                    <p>
                        Try a different search or filter.
                    </p>
                </div>

            </div>
        `;

        return;
    }


    // Original events from localStorage
    const allEvents =
        JSON.parse(
            localStorage.getItem("intelliSlotEvents")
        ) || [];


    events.forEach((event) => {

        const eventItem =
            document.createElement("div");

        eventItem.classList.add(
            "calendar-event-item"
        );


        // Find original event index
        const originalIndex =
            allEvents.findIndex(
                (savedEvent) =>
                    savedEvent.name === event.name &&
                    savedEvent.date === event.date &&
                    savedEvent.time === event.time
            );


        eventItem.innerHTML = `

            <span>📅</span>

            <div class="event-details">

                <strong>
                    ${event.name}
                </strong>

                <p>
                    ${event.date}
                    •
                    ${event.time}

                    ${
                        event.location
                            ? " • " + event.location
                            : ""
                    }

                </p>

                <small>
                    ${event.type}
                </small>


                <div class="event-actions">

                    <button
                        class="edit-event-btn"
                        type="button"
                    >
                        ✏️ Edit
                    </button>


                    <button
                        class="delete-event-btn"
                        type="button"
                    >
                        🗑️ Delete
                    </button>

                </div>

            </div>
        `;


        // Edit button
        const editBtn =
            eventItem.querySelector(
                ".edit-event-btn"
            );

        editBtn.addEventListener(
            "click",
            () => {

                if (originalIndex !== -1) {
                    editEvent(originalIndex);
                }

            }
        );


        // Delete button
        const deleteBtn =
            eventItem.querySelector(
                ".delete-event-btn"
            );

        deleteBtn.addEventListener(
            "click",
            () => {

                if (originalIndex !== -1) {
                    deleteEvent(originalIndex);
                }

            }
        );


        eventList.appendChild(eventItem);

    });
}


function saveEvent(eventName, eventDate, eventTime) {
    const events = JSON.parse(
        localStorage.getItem("intelliSlotEvents") || "[]"
    );

    const newEvent = {
        id: Date.now(),
        name: eventName,
        date: eventDate,
        time: eventTime
    };

    events.push(newEvent);

    localStorage.setItem(
        "intelliSlotEvents",
        JSON.stringify(events)
    );

    alert("Event saved successfully!");
}

// ==========================================
// SEARCH INPUT
// ==========================================

const eventSearch =
    document.getElementById(
        "eventSearch"
    );


if (eventSearch) {

    eventSearch.addEventListener(
        "input",
        filterEvents
    );

}


// ==========================================
// FILTER DROPDOWN
// ==========================================

const eventFilter =
    document.getElementById(
        "eventFilter"
    );


if (eventFilter) {

    eventFilter.addEventListener(
        "change",
        filterEvents
    );

}


// ==========================================
// REMINDER SYSTEM
// ==========================================

function check14DayReminders() {

    let events =
        JSON.parse(
            localStorage.getItem(
                "intelliSlotEvents"
            )
        ) || [];


    const today = new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    events.forEach(
        (event) => {

            const eventDate =
                new Date(event.date);

            eventDate.setHours(
                0,
                0,
                0,
                0
            );


            const difference =
                eventDate.getTime() -
                today.getTime();


            const daysRemaining =
                Math.ceil(
                    difference /
                    (1000 * 60 * 60 * 24)
                );


            if (
                daysRemaining >= 0 &&
                daysRemaining <= 14
            ) {

                console.log(
                    `Reminder: ${event.name} is in ${daysRemaining} day(s).`
                );

            }

        }
    );
}


// ==========================================
// NOTIFICATION SYSTEM
// ==========================================

function generateNotifications() {

    let events =
        JSON.parse(
            localStorage.getItem(
                "intelliSlotEvents"
            )
        ) || [];


    const today = new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    events.forEach(
        (event) => {

            const eventDate =
                new Date(event.date);

            eventDate.setHours(
                0,
                0,
                0,
                0
            );


            const difference =
                eventDate.getTime() -
                today.getTime();


            const daysRemaining =
                Math.ceil(
                    difference /
                    (1000 * 60 * 60 * 24)
                );


            if (
                daysRemaining >= 0 &&
                daysRemaining <= 14
            ) {

                console.log(
                    `🔔 Notification: ${event.name} is in ${daysRemaining} day(s).`
                );

            }

        }
    );
}


// ==========================================
// INITIAL LOAD
// ==========================================


async function loadEventsFromDatabase() {
    try {
        const response = await fetch("http://localhost:5000/api/events");

        if (!response.ok) {
            throw new Error("Could not load events");
        }

        const databaseEvents = await response.json();

        const events = databaseEvents.map(event => ({
            id: event.id,
            name: event.title,
            date: String(event.event_date).slice(0, 10),
            time: event.event_time || "",
            type: event.category || "other",
            location: event.location || ""
        }));

        localStorage.setItem("intelliSlotEvents", JSON.stringify(events));

        displaySavedEvents();
        check14DayReminders();
        generateNotifications();

    } catch (error) {
        console.error("Load events error:", error);
        displaySavedEvents();
        alert("Could not load events from database. Check your backend.");
    }
}

displayCalendar();
loadEventsFromDatabase();
