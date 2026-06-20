const weatherForm = document.querySelector(".weather-form");
const cityInput = document.querySelector(".city-input");
const cardDisplay = document.querySelector(".card-display");

weatherForm.onsubmit = async function(event) {
    event.preventDefault();
    
    const city = cityInput.value.trim();
    
    if (city) {
        try {
            const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to retrieve metric matrices.");
            }
            
            const weatherData = await response.json();
            displayWeatherInfo(weatherData);
        } catch (error) {
            displayError(error.message);
        }
    } else {
        displayError("Please enter a city.");
    }
};

function displayWeatherInfo(data) {
    const { 
        name: city, 
        main: { temp, humidity }, 
        weather: [{ description, id }] 
    } = data;

    cardDisplay.textContent = "";
    cardDisplay.style.display = "flex";
    cardDisplay.style.background = "linear-gradient(180deg, #1e3a8a 0%, #3b82f6 100%)";

    const cityDisplay = document.createElement("h2");
    const tempDisplay = document.createElement("p");
    const humidityDisplay = document.createElement("p");
    const descDisplay = document.createElement("p");
    const weatherEmoji = document.createElement("p");

    cityDisplay.textContent = city;
    cityDisplay.className = "city-display";

    const tempFahrenheit = ((temp - 273.15) * 9/5 + 32).toFixed(1);
    tempDisplay.textContent = `${tempFahrenheit}°F`;
    tempDisplay.className = "temp-display";

    humidityDisplay.textContent = `Humidity: ${humidity}%`;
    humidityDisplay.className = "humidity-display";

    descDisplay.textContent = description;
    descDisplay.className = "desc-display";

    weatherEmoji.textContent = getWeatherEmoji(id);
    weatherEmoji.className = "weather-emoji";

    cardDisplay.appendChild(cityDisplay);
    cardDisplay.appendChild(tempDisplay);
    cardDisplay.appendChild(humidityDisplay);
    cardDisplay.appendChild(descDisplay);
    cardDisplay.appendChild(weatherEmoji);
}

function getWeatherEmoji(weatherId) {
    switch (true) {
        case (weatherId >= 200 && weatherId < 300):
            return "⚡";
        case (weatherId >= 300 && weatherId < 400):
            return "🌧️";
        case (weatherId >= 500 && weatherId < 600):
            return "🌦️";
        case (weatherId >= 600 && weatherId < 700):
            return "❄️";
        case (weatherId >= 700 && weatherId < 800):
            return "🌫️";
        case (weatherId === 800):
            return "☀️";
        case (weatherId > 800 && weatherId < 810):
            return "☁️";
        default:
            return "❓";
    }
}

function displayError(message) {
    cardDisplay.textContent = "";
    cardDisplay.style.display = "flex";
    cardDisplay.style.background = "transparent";

    const errorDisplay = document.createElement("p");
    errorDisplay.textContent = message;
    errorDisplay.className = "error-display";

    cardDisplay.appendChild(errorDisplay);
}