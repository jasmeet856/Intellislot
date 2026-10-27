// ==========================================
// CAMPUS EVENTS
// ==========================================


// Search & Filter Elements

const campusSearch =
    document.getElementById("campusSearch");

const campusFilter =
    document.getElementById("campusFilter");

const campusEvents =
    document.querySelectorAll(".campus-event-card");

const noCampusEvents =
    document.getElementById("noCampusEvents");


// ==========================================
// SEARCH + FILTER
// ==========================================

function filterCampusEvents() {

    const searchText =
        campusSearch.value
            .toLowerCase()
            .trim();

    const selectedCategory =
        campusFilter.value;


    let visibleEvents = 0;


    campusEvents.forEach(
        (event) => {

            const eventName =
                event.querySelector("h3")
                    .textContent
                    .toLowerCase();


            const category =
                event.dataset.category;


            const matchesSearch =
                eventName.includes(
                    searchText
                );


            const matchesCategory =
                selectedCategory === "All" ||
                category === selectedCategory;


            if (
                matchesSearch &&
                matchesCategory
            ) {

                event.style.display =
                    "flex";

                visibleEvents++;

            }

            else {

                event.style.display =
                    "none";

            }

        }
    );


    if (visibleEvents === 0) {

        noCampusEvents.style.display =
            "block";

    }

    else {

        noCampusEvents.style.display =
            "none";

    }

}


// Search

if (campusSearch) {

    campusSearch.addEventListener(
        "input",
        filterCampusEvents
    );

}


// Filter

if (campusFilter) {

    campusFilter.addEventListener(
        "change",
        filterCampusEvents
    );

}


// ==========================================
// ADD TO MY CALENDAR
// ==========================================

const addCalendarButtons =
    document.querySelectorAll(
        ".add-calendar-btn"
    );


addCalendarButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                const eventData = {

                    name:
                        button.dataset.name,

                    date:
                        button.dataset.date,

                    time:
                        button.dataset.time,

                    type:
                        button.dataset.type,

                    location:
                        button.dataset.location

                };


                let events =
                    JSON.parse(
                        localStorage.getItem(
                            "intelliSlotEvents"
                        )
                    ) || [];


                // Check duplicate

                const alreadyExists =
                    events.some(
                        (event) =>
                            event.name ===
                                eventData.name &&
                            event.date ===
                                eventData.date &&
                            event.time ===
                                eventData.time
                    );


                if (alreadyExists) {

                    alert(
                        "This event is already in your calendar."
                    );

                    return;

                }


                // Add event

                events.push(eventData);


                localStorage.setItem(
                    "intelliSlotEvents",
                    JSON.stringify(events)
                );


                alert(
                    `${eventData.name} added to My Calendar!`
                );


                // Change button

                button.textContent =
                    "✓ Added to Calendar";

                button.disabled = true;

                button.style.opacity =
                    "0.7";

            }
        );

    }
);