function updateUI(data) {
  document.querySelectorAll("[data-bind]").forEach(el => {
    const key = el.dataset.bind;
    if (data[key] !== undefined) el.textContent = data[key];
  });
}

function renderWeather(source) {
  const weather = {
    location: source.location.name,
    temp: source.current.temp_c,
    feelslike: source.current.feelslike_c,
    condition: source.current.condition.text,
    wind: `${source.current.wind_kph} km/h ${source.current.wind_dir}`,
    aqi: source.current.air_quality["us-epa-index"] <= 2 ? "Good" : "Unhealthy",
    time: new Date().toLocaleString(),
    healthTip:
      source.current.air_quality["us-epa-index"] <= 2
        ? "Air quality is good."
        : "Reduce outdoor activity."
  };

  updateUI(weather);
}

(async () => {
  const adminData = Storage.load("adminWeather");
  if (adminData) {
    updateUI(adminData);
  } else {
    const apiData = await fetchWeather();
    renderWeather(apiData);
  }
})();
