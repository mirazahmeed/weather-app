const API_URL =
  "http://api.weatherapi.com/v1/current.json?key=5383f81661d64232ab3151618253012&q=London&aqi=yes";

async function fetchWeather() {
  const res = await fetch(API_URL);
  const data = await res.json();
  Storage.save("apiWeather", data);
  return data;
}
