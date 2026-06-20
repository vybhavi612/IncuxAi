async function getWeather() {
  const city = document.getElementById("city").value.trim();
  const resultEl = document.getElementById("result");

  resultEl.innerHTML = "";

  if (!city) {
    resultEl.textContent = "Please enter a city.";
    return;
  }

  // Dummy API fallback:
  // Open-Meteo does not require an API key (good for demos).
  // If you later want OpenWeatherMap, replace this block.
  const url = `https://api.open-meteo.com/v1/forecast?latitude=0&longitude=0&current=temperature_2m,weather_code&timezone=auto`;

  try {
    // Dummy behavior: we call a demo API and show mocked city name.
    // (For real city-based weather, you'd geocode city -> lat/long.)
    const response = await fetch(url);
    const data = await response.json();

    const temp = data?.current?.temperature_2m;
    const weatherCode = data?.current?.weather_code;

    const description =
      weatherCode != null
        ? `Weather code: ${weatherCode}`
        : "Weather data unavailable";

    resultEl.innerHTML = `
      <h2>${city}</h2>
      <p>${temp} °C (demo)</p>
      <p>${description}</p>
    `;
  } catch (error) {
    console.log(error);
    resultEl.textContent = "Could not fetch weather (check internet connection).";
  }
}

document.getElementById("searchBtn").addEventListener("click", getWeather);

document.getElementById("city").addEventListener("keydown", (e) => {
  if (e.key === "Enter") getWeather();
});

