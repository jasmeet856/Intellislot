// ==========================================
// CORPORATE EVENTS
// ==========================================


const corporateSearch =
    document.getElementById("corporateSearch");

const corporateFilter =
    document.getElementById("corporateFilter");

const corporateEvents =
    document.querySelectorAll(
        ".corporate-event-card"
    );

const noCorporateEvents =
    document.getElementById(
        "noCorporateEvents"
    );


// ==========================================
// SEARCH + FILTER
// ==========================================

function filterCorporateEvents() {

    const searchText =
        corporateSearch.value
            .toLowerCase()
            .trim();

    const selectedCategory =
        corporateFilter.value;


    let visibleEvents = 0;


    corporateEvents.forEach(
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

        noCorporateEvents.style.display =
            "block";

    }

    else {

        noCorporateEvents.style.display =
            "none";

    }

}


// Search

if (corporateSearch) {

    corporateSearch.addEventListener(
        "input",
        filterCorporateEvents
    );

}


// Filter

if (corporateFilter) {

    corporateFilter.addEventListener(
        "change",
        filterCorporateEvents
    );

}


// ==========================================
// ADD TO MY CALENDAR
// ==========================================

const addCorporateButtons =
    document.querySelectorAll(
        ".add-corporate-btn"
    );


addCorporateButtons.forEach(
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