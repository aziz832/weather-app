// OpenMeteo API configuration
const API_BASE_URL = 'https://api.open-meteo.com/v1';

// Weather icons mapping
const weatherIcons = {
    0: '☀️', // Clear sky
    1: '🌤️', // Mainly clear
    2: '⛅', // Partly cloudy
    3: '☁️', // Overcast
    45: '🌫️', // Foggy
    48: '🌫️', // Rime fog
    51: '🌦️', // Light drizzle
    53: '🌦️', // Moderate drizzle
    55: '🌧️', // Dense drizzle
    61: '🌧️', // Slight rain
    63: '🌧️', // Moderate rain
    65: '🌧️', // Heavy rain
    71: '🌨️', // Slight snow
    73: '🌨️', // Moderate snow
    75: '🌨️', // Heavy snow
    77: '🌨️', // Snow grains
    80: '🌦️', // Light rain showers
    81: '🌧️', // Moderate rain showers
    82: '⛈️', // Violent rain showers
    85: '🌨️', // Light snow showers
    86: '🌨️', // Heavy snow showers
    95: '⛈️', // Thunderstorm
    96: '⛈️', // Thunderstorm with hail
    99: '⛈️'  // Thunderstorm with heavy hail
};

async function getWeather() {
    const zipcode = document.getElementById('zipcode').value;
    const errorElement = document.getElementById('error');
    const forecastElement = document.getElementById('forecast');
    const locationElement = document.getElementById('location-info');

    // Validate ZIP code
    if (!zipcode.match(/^\d{5}$/)) {
        errorElement.textContent = 'Please enter a valid 5-digit US ZIP code';
        locationElement.style.display = 'none';
        forecastElement.innerHTML = '';
        return;
    }

    try {
        errorElement.textContent = '';
        locationElement.style.display = 'none';
        forecastElement.innerHTML = '<div class="day">Loading weather data...</div>';

        // First, get location from ZIP code using zippopotam.us API
        const zipResponse = await fetch(`https://api.zippopotam.us/us/${zipcode}`);
        if (!zipResponse.ok) {
            throw new Error('ZIP code not found');
        }
        
        const zipData = await zipResponse.json();
        const cityName = zipData.places[0]['place name'];
        const stateName = zipData.places[0]['state'];
        const latitude = parseFloat(zipData.places[0]['latitude']);
        const longitude = parseFloat(zipData.places[0]['longitude']);

        // Display location information
        locationElement.innerHTML = `
            <div class="location-icon">📍</div>
            <div class="location-details">
                <div class="location-name">${cityName}</div>
                <div class="location-region">${stateName}, USA</div>
            </div>
        `;
        locationElement.style.display = 'flex';
        
        // Fetch weather data using coordinates
        const weatherResponse = await fetch(
            `${API_BASE_URL}/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&timezone=America/New_York`
        );
        
        if (!weatherResponse.ok) {
            throw new Error('Weather data not available');
        }

        const data = await weatherResponse.json();
        displayWeather(data.daily);
    } catch (error) {
        forecastElement.innerHTML = '';
        if (error.message === 'ZIP code not found') {
            errorElement.textContent = 'Please enter a valid US ZIP code';
        } else {
            errorElement.textContent = 'Error fetching weather data. Please try again later.';
        }
        console.error('Weather API Error:', error);
    }
}

function displayWeather(dailyData) {
    const forecastElement = document.getElementById('forecast');
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let forecastHTML = '';
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(dailyData.time[i]);
        const dayName = days[date.getDay()];
        const monthName = months[date.getMonth()];
        const dayOfMonth = date.getDate();
        
        const weatherCode = dailyData.weather_code[i];
        const maxTemp = Math.round(dailyData.temperature_2m_max[i]);
        const minTemp = Math.round(dailyData.temperature_2m_min[i]);
        const precipProb = dailyData.precipitation_probability_max[i];
        
        forecastHTML += `
            <div class="day">
                <h3>${dayName}</h3>
                <div class="date">${monthName} ${dayOfMonth}</div>
                <div style="font-size: 2em;">${weatherIcons[weatherCode] || '🌡️'}</div>
                <div class="temp">${maxTemp}°F <span class="min">${minTemp}°F</span></div>
                <div class="precipitation">💧 ${precipProb}%</div>
            </div>
        `;
    }
    
    forecastElement.innerHTML = forecastHTML;
}

// Add event listener for Enter key on ZIP code input
document.getElementById('zipcode').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        getWeather();
    }
});
