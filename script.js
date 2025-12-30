const API_KEY = "5383f81661d64232ab3151618253012";
const locationMessage = document.getElementById("locationMessage");

/* ================================
   ALL COUNTRIES LIST (STATIC)
================================ */
const countries = [
    { name: "Afghanistan", city: "Kabul" },
    { name: "Argentina", city: "Buenos Aires" },
    { name: "Australia", city: "Sydney" },
    { name: "Bangladesh", city: "Dhaka" },
    { name: "Brazil", city: "Brasília" },
    { name: "Canada", city: "Toronto" },
    { name: "China", city: "Beijing" },
    { name: "Egypt", city: "Cairo" },
    { name: "France", city: "Paris" },
    { name: "Germany", city: "Berlin" },
    { name: "India", city: "New Delhi" },
    { name: "Indonesia", city: "Jakarta" },
    { name: "Italy", city: "Rome" },
    { name: "Japan", city: "Tokyo" },
    { name: "Mexico", city: "Mexico City" },
    { name: "Nepal", city: "Kathmandu" },
    { name: "Netherlands", city: "Amsterdam" },
    { name: "Pakistan", city: "Islamabad" },
    { name: "Russia", city: "Moscow" },
    { name: "Saudi Arabia", city: "Riyadh" },
    { name: "South Africa", city: "Cape Town" },
    { name: "South Korea", city: "Seoul" },
    { name: "Spain", city: "Madrid" },
    { name: "Sri Lanka", city: "Colombo" },
    { name: "United Kingdom", city: "London" },
    { name: "United States", city: "New York" },
];

/* ================================
   TOP COUNTRIES (RANDOM)
================================ */
const cities = [
    "London",
    "New York",
    "Tokyo",
    "Paris",
    "Dubai",
    "Sydney",
    "Berlin",
    "Toronto",
    "Singapore",
    "Rome",
];

const topCountriesEl = document.getElementById("topCountries");

function getRandomCities(list, count) {
    return [...list].sort(() => 0.5 - Math.random()).slice(0, count);
}

async function loadTopCountries() {
    const selected = getRandomCities(cities, 5);
    topCountriesEl.innerHTML = "";

    for (const city of selected) {
        const res = await fetch(
            `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}`
        );
        const data = await res.json();

        const card = document.createElement("div");
        card.className = "country-card";
        card.innerHTML = `
      <h4>${data.location.name}</h4>
      <span>${data.current.temp_c}°C</span>
      <p>${data.current.condition.text}</p>
    `;

        card.onclick = () => updateUI(data);
        topCountriesEl.appendChild(card);
    }
}

/* ================================
   USER SEARCH
================================ */
const locationInput = document.getElementById("locationInput");
const searchBtn = document.getElementById("searchBtn");

searchBtn.addEventListener("click", () => {
    const city = locationInput.value.trim();
    if (!city) return alert("Enter a location");
    fetchWeatherByCity(city);
});

async function fetchWeatherByCity(city) {
    const res = await fetch(
        `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&aqi=yes`
    );
    const data = await res.json();

    if (data.error) {
        alert("Location not found");
        return;
    }

    updateUI(data);
}

/* ================================
   GEOLOCATION (DEFAULT WEATHER)
================================ */
function showLocationMessage() {
    locationMessage.classList.add("show");
}

function hideLocationMessage() {
    locationMessage.classList.remove("show");
}

function loadUserLocationWeather() {
    if (!navigator.geolocation) {
        showLocationMessage();
        fetchWeatherByCity("London");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            hideLocationMessage();

            const { latitude, longitude } = position.coords;
            const res = await fetch(
                `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${latitude},${longitude}&aqi=yes`
            );
            const data = await res.json();
            updateUI(data);
        },
        () => {
            // Permission denied or location off
            showLocationMessage();
            fetchWeatherByCity("London");
        }
    );
}

/* ================================
   UPDATE UI
================================ */
function updateUI(data) {
    document.getElementById("weatherCard").style.display = "block";

    document.getElementById(
        "location"
    ).textContent = `${data.location.name}, ${data.location.country}`;

    document.getElementById("temp").textContent = data.current.temp_c;

    document.getElementById("feelsLike").textContent = data.current.feelslike_c;

    document.getElementById("condition").textContent =
        data.current.condition.text;

    document.getElementById(
        "wind"
    ).textContent = `${data.current.wind_kph} km/h ${data.current.wind_dir}`;

    const aqi = data.current.air_quality?.["us-epa-index"];
    const aqiText = aqi <= 2 ? "Good" : aqi <= 4 ? "Moderate" : "Unhealthy";

    const aqiEl = document.getElementById("aqi");
    aqiEl.textContent = `AQI: ${aqiText}`;
    aqiEl.style.color = aqi <= 2 ? "green" : aqi <= 4 ? "orange" : "red";

    document.getElementById("time").textContent = new Date().toLocaleString();
}

/* ================================
   LEFT SIDEBAR COUNTRY LIST
================================ */
const countryListEl = document.getElementById("countryList");

function loadAllCountries() {
    countryListEl.innerHTML = "";

    countries.forEach(({ name, city }) => {
        const li = document.createElement("li");
        li.textContent = name;

        li.onclick = () => {
            document
                .querySelectorAll(".sidebar li")
                .forEach((item) => item.classList.remove("active"));

            li.classList.add("active");
            fetchWeatherByCity(city);
        };

        countryListEl.appendChild(li);
    });
}
document.getElementById("countrySearch").addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase();
    document.querySelectorAll(".sidebar li").forEach((li) => {
        li.style.display = li.textContent.toLowerCase().includes(value)
            ? "block"
            : "none";
    });
});

loadAllCountries();

/* INIT */
loadSidebarCountries();

/* ================================
   INIT
================================ */
loadUserLocationWeather();
loadTopCountries();
