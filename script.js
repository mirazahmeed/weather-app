/* ================================
   CONFIG & DOM
================================ */
const API_KEY = "5383f81661d64232ab3151618253012";

const countrySearch = document.getElementById("countrySearch");
const countryListEl = document.getElementById("countryList");
const favoriteListEl = document.getElementById("favoriteList");
const topCountriesEl = document.getElementById("topCountries");
const overlay = document.getElementById("sidebarOverlay");
const sidebar = document.querySelector(".sidebar");

const locationInput = document.getElementById("locationInput");
const searchBtn = document.getElementById("searchBtn");
const autocompleteEl = document.getElementById("autocomplete");

/* ================================
   STATE
================================ */
let allCountries = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let visibleCount = 30;

let suggestions = [];
let activeIndex = -1;

/* ================================
   LOAD COUNTRIES
================================ */
async function loadCountriesJSON() {
  const res = await fetch("countries.json");
  allCountries = await res.json();
  renderCountries();
  renderFavorites();
}

/* ================================
   RENDER COUNTRIES (SIDEBAR)
================================ */
function renderCountries(filter = "") {
  countryListEl.innerHTML = "";

  const list = filter
    ? allCountries.filter(c =>
        c.name.toLowerCase().includes(filter.toLowerCase())
      )
    : allCountries;

  list.slice(0, visibleCount).forEach(c => {
    const li = document.createElement("li");
    li.innerHTML = `
      <img src="https://flagcdn.com/w20/${c.code.toLowerCase()}.png">
      <span>${c.name}</span>
      <button class="fav ${favorites.includes(c.name) ? "active" : ""}">⭐</button>
    `;
    li.onclick = () => fetchWeather(c.capital);
    countryListEl.appendChild(li);
  });
}

/* ================================
   COUNTRY SEARCH (SIDEBAR)
================================ */
countrySearch.addEventListener("input", e => {
  visibleCount = 30;
  renderCountries(e.target.value);
});

/* ================================
   FAVORITES
================================ */
countryListEl.addEventListener("click", e => {
  if (!e.target.classList.contains("fav")) return;

  e.stopPropagation();
  const name = e.target.previousElementSibling.textContent;

  favorites.includes(name)
    ? (favorites = favorites.filter(f => f !== name))
    : favorites.push(name);

  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderCountries();
  renderFavorites();
});

function renderFavorites() {
  favoriteListEl.innerHTML = "";
  favorites.forEach(name => {
    const c = allCountries.find(x => x.name === name);
    if (!c) return;

    const li = document.createElement("li");
    li.textContent = name;
    li.onclick = () => fetchWeather(c.capital);
    favoriteListEl.appendChild(li);
  });
}

/* ================================
   CITY AUTOCOMPLETE
================================ */
locationInput.addEventListener("input", async e => {
  const query = e.target.value.trim();
  activeIndex = -1;

  if (query.length < 2) {
    autocompleteEl.style.display = "none";
    return;
  }

  const res = await fetch(
    `http://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${query}`
  );
  suggestions = await res.json();

  if (!suggestions.length) {
    autocompleteEl.style.display = "none";
    return;
  }

  autocompleteEl.innerHTML = suggestions
    .slice(0, 6)
    .map(
      s => `
      <div>
        ${s.name}${s.region ? ", " + s.region : ""}, ${s.country}
      </div>
    `
    )
    .join("");

  autocompleteEl.style.display = "block";
});

autocompleteEl.addEventListener("click", e => {
  if (!e.target.matches("div")) return;

  const text = e.target.textContent;
  locationInput.value = text;
  autocompleteEl.style.display = "none";
  fetchWeather(text);
});

/* Keyboard navigation */
locationInput.addEventListener("keydown", e => {
  const items = autocompleteEl.querySelectorAll("div");
  if (!items.length) return;

  if (e.key === "ArrowDown") {
    activeIndex = (activeIndex + 1) % items.length;
  } else if (e.key === "ArrowUp") {
    activeIndex = (activeIndex - 1 + items.length) % items.length;
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (activeIndex >= 0) items[activeIndex].click();
    return;
  } else {
    return;
  }

  items.forEach((item, i) =>
    item.classList.toggle("active", i === activeIndex)
  );
});

/* Close autocomplete on outside click */
document.addEventListener("click", e => {
  if (!e.target.closest(".search-card")) {
    autocompleteEl.style.display = "none";
  }
});

/* ================================
   CITY SEARCH BUTTON
================================ */
searchBtn.addEventListener("click", () => {
  const city = locationInput.value.trim();
  if (!city) return alert("Enter a city name");
  fetchWeather(city);
});

/* ================================
   WEATHER FETCH
================================ */
async function fetchWeather(city) {
  const res = await fetch(
    `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&aqi=yes`
  );
  const data = await res.json();

  updateUI(data);

  if (window.innerWidth <= 768) {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  }
}

function updateUI(data) {
  document.getElementById("weatherCard").style.display = "block";
  document.getElementById("location").textContent =
    `${data.location.name}, ${data.location.country}`;
  document.getElementById("temp").textContent = data.current.temp_c;
  document.getElementById("feelsLike").textContent = data.current.feelslike_c;
  document.getElementById("condition").textContent =
    data.current.condition.text;
  document.getElementById("wind").textContent =
    `${data.current.wind_kph} km/h ${data.current.wind_dir}`;
  document.getElementById("time").textContent =
    new Date().toLocaleString();
}

/* ================================
   SIDEBAR TOGGLE (MOBILE)
================================ */
document.getElementById("menuBtn").onclick = () => {
  sidebar.classList.add("open");
  overlay.classList.add("show");
};

overlay.onclick = () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
};

/* ================================
   INIT
================================ */
loadCountriesJSON();
fetchWeather("London");

/* ================================
   PWA
================================ */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
