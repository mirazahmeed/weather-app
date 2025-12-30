const adminPanel = document.getElementById("adminPanel");
document.getElementById("adminToggle").onclick = () =>
  adminPanel.classList.toggle("open");

document.getElementById("adminForm").onsubmit = e => {
  e.preventDefault();

  const data = {
    location: adminLocation.value,
    temp: adminTemp.value,
    feelslike: adminFeels.value,
    condition: adminCondition.value,
    wind: adminWind.value,
    aqi: adminAqi.value,
    time: new Date().toLocaleString(),
    healthTip:
      adminAqi.value === "Good"
        ? "Air quality is good."
        : "Limit outdoor activity."
  };

  Storage.save("adminWeather", data);
  updateUI(data);
};

document.getElementById("resetBtn").onclick = () => {
  Storage.clear("adminWeather");
  location.reload();
};

document.getElementById("toggleRadar").onchange = e => {
  document.getElementById("radarSection").style.display =
    e.target.checked ? "block" : "none";
};

document.getElementById("themeSelect").onchange = e => {
  document.body.dataset.theme = e.target.value;
  Storage.save("theme", e.target.value);
};

const savedTheme = Storage.load("theme");
if (savedTheme) document.body.dataset.theme = savedTheme;
