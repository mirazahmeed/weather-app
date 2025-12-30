/* ================================
   CONFIG
================================ */
const API_KEY = "5383f81661d64232ab3151618253012";
const locationMessage = document.getElementById("locationMessage");

/* ================================
   GLOBAL STATE
================================ */
const countryListEl = document.getElementById("countryList");
const topCountriesEl = document.getElementById("topCountries");

let allCountries = [];
let visibleCount = 30;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

/* ================================
   LOAD COUNTRIES (JSON + LAZY)
================================ */
async function loadCountriesJSON() {
    try {
        const res = await fetch("countries.json");
        allCountries = await res.json();
        renderCountries(true);
    } catch (err) {
        console.error("Failed to load countries.json");
    }
}

function renderCountries(reset = false) {
    if (reset) countryListEl.innerHTML = "";

    const slice = allCountries.slice(0, visibleCount);

    slice.forEach(({ name, capital, code }) => {
        if (document.getElementById(code)) return;

        const li = document.createElement("li");
        li.id = code;
        li.innerHTML = `
      <img src="https://flagcdn.com/w20/${code.toLowerCase()}.png" />
      <span>${name}</span>
      <button class="fav ${
          favorites.includes(name) ? "active" : ""
      }">⭐</button>
    `;

        li.addEventListener("click", () => fetchWeatherByCity(capital));
        countryListEl.appendChild(li);
    });
}

/* LAZY LOAD ON SCROLL */
countryListEl.addEventListener("scroll", () => {
    if (
        countryListEl.scrollTop + countryListEl.clientHeight >=
        countryListEl.scrollHeight - 10
    ) {
        visibleCount += 20;
        renderCountries();
    }
});

/* ================================
   FAVORITES
================================ */
countryListEl.addEventListener("click", (e) => {
    if (e.target.classList.contains("fav")) {
        e.stopPropagation();
        const country =
            e.target.parentElement.querySelector("span").textContent;

        if (favorites.includes(country)) {
            favorites = favorites.filter((c) => c !== country);
        } else {
            favorites.push(country);
        }

        localStorage.setItem("favorites", JSON.stringify(favorites));
        e.target.classList.toggle("active");
    }
});

let countryIndex = {};

function buildCountryIndex() {
    allCountries.forEach((c) => {
        countryIndex[c.name.toLowerCase()] = c;
    });
}

/* ================================
   PIN CURRENT COUNTRY
================================ */
function pinUserCountry(countryName) {
    const li = [...document.querySelectorAll(".sidebar li")].find(
        (el) => el.querySelector("span")?.textContent === countryName
    );

    if (li) {
        li.classList.add("active");
        li.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

/* ================================
   TOP COUNTRIES (RANDOM)
================================ */
const randomCities = [
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

function getRandomCities(list, count) {
    return [...list].sort(() => 0.5 - Math.random()).slice(0, count);
}

async function loadTopCountries() {
    const selected = getRandomCities(randomCities, 5);
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

        card.addEventListener("click", () => updateUI(data));
        topCountriesEl.appendChild(card);
    }
}

/* ================================
   SEARCH
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
   GEOLOCATION
================================ */
function showLocationMessage() {
    locationMessage?.classList.add("show");
}

function hideLocationMessage() {
    locationMessage?.classList.remove("show");
}

function loadUserLocationWeather() {
    if (!navigator.geolocation) {
        showLocationMessage();
        fetchWeatherByCity("London");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            hideLocationMessage();
            const { latitude, longitude } = pos.coords;

            const res = await fetch(
                `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${latitude},${longitude}&aqi=yes`
            );
            const data = await res.json();
            updateUI(data);
        },
        () => {
            showLocationMessage();
            fetchWeatherByCity("London");
        }
    );
}
countrySearch.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    countryListEl.innerHTML = "";

    Object.keys(countryIndex)
        .filter((name) => name.includes(query))
        .slice(0, 30)
        .forEach((key) => {
            const { name, capital, code } = countryIndex[key];

            const li = document.createElement("li");
            li.innerHTML = `
        <img src="https://flagcdn.com/w20/${code.toLowerCase()}.png" />
        <span>${name}</span>
      `;
            li.onclick = () => fetchWeatherByCity(capital);
            countryListEl.appendChild(li);
        });
});

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

    pinUserCountry(data.location.country);
}
const favoriteListEl = document.getElementById("favoriteList");

function renderFavorites() {
    favoriteListEl.innerHTML = "";

    favorites.forEach((name) => {
        const country = allCountries.find((c) => c.name === name);
        if (!country) return;

        const li = document.createElement("li");
        li.textContent = country.name;
        li.onclick = () => fetchWeatherByCity(country.capital);
        favoriteListEl.appendChild(li);
    });
}
document.getElementById("menuBtn").onclick = () => {
    document.querySelector(".sidebar").classList.toggle("open");
};
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
}

/* ================================
INIT (ONLY ONCE)
================================ */
loadCountriesJSON();
loadUserLocationWeather();
loadTopCountries();
renderFavorites();

buildCountryIndex();
