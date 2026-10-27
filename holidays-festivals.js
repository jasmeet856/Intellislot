const holidaySearch = document.getElementById("holidaySearch");
const holidayFilter = document.getElementById("holidayFilter");

const holidayCards = document.querySelectorAll(".holiday-card");

const noHolidays = document.getElementById("noHolidays");


/* Search + Filter */

function filterHolidays() {

    const searchText =
        holidaySearch.value.toLowerCase().trim();

    const selectedCategory =
        holidayFilter.value;

    let visibleHolidays = 0;


    holidayCards.forEach((holiday) => {

        const holidayName =
            holiday.dataset.name.toLowerCase();

        const category =
            holiday.dataset.category;


        const matchesSearch =
            holidayName.includes(searchText);


        const matchesCategory =
            selectedCategory === "All" ||
            category === selectedCategory;


        if (matchesSearch && matchesCategory) {

            holiday.style.display = "flex";

            visibleHolidays++;

        } else {

            holiday.style.display = "none";

        }

    });


    if (visibleHolidays === 0) {

        noHolidays.style.display = "block";

    } else {

        noHolidays.style.display = "none";

    }

}


/* Search Event */

if (holidaySearch) {

    holidaySearch.addEventListener(
        "input",
        filterHolidays
    );

}


/* Filter Event */

if (holidayFilter) {

    holidayFilter.addEventListener(
        "change",
        filterHolidays
    );

}


/* Add Holiday to Calendar */

const addHolidayButtons =
    document.querySelectorAll(".add-holiday-btn");


addHolidayButtons.forEach((button) => {

    button.addEventListener("click", () => {


        const eventData = {

            name: button.dataset.name,

            date: button.dataset.date,

            time: button.dataset.time,

            type: button.dataset.type,

            location: button.dataset.location

        };


        let events =
            JSON.parse(
                localStorage.getItem("intelliSlotEvents")
            ) || [];


        /* Check Duplicate */

        const alreadyExists =
            events.some(
                (event) =>
                    event.name === eventData.name &&
                    event.date === eventData.date &&
                    event.time === eventData.time
            );


        if (alreadyExists) {

            alert(
                "This holiday is already in your calendar."
            );

            return;

        }


        /* Add Event */

        events.push(eventData);


        localStorage.setItem(
            "intelliSlotEvents",
            JSON.stringify(events)
        );


        alert(
            `${eventData.name} added to My Calendar!`
        );


        /* Change Button */

        button.textContent =
            "✓ Added to Calendar";

        button.disabled = true;

        button.style.opacity = "0.7";

    });

});