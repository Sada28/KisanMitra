import { WEATHER_API_KEY, WEATHER_API_URL } from './endpoint';

// ===== Current Weather =====
export const fetchCurrentWeather = async (lat, lon) => {
  try {
    const url = `${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=hi`;
    console.log('Weather URL:', url);

    const res = await fetch(url);
    const data = await res.json();

    if (data.cod !== 200) {
      console.log('Weather error:', data.message);
      return null;
    }

    return {
      city: data.name,
      state: data.sys?.country || 'IN',
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      mainWeather: data.weather[0].main,
      visibility: Math.round((data.visibility || 0) / 1000), // meters to km
      pressure: data.main.pressure,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      cloudiness: data.clouds?.all || 0,
    };
  } catch (e) {
    console.log('fetchCurrentWeather error:', e);
    return null;
  }
};

// ===== 5 Day Forecast =====
export const fetchForecast = async (lat, lon) => {
  try {
    const url = `${WEATHER_API_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=hi`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.cod !== '200') {
      console.log('Forecast error:', data.message);
      return [];
    }

    // Har din ka ek record nikalo (noon ka)
    const dailyMap = {};
    data.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      const hour = item.dt_txt.split(' ')[1];
      if (!dailyMap[date] || hour === '12:00:00') {
        dailyMap[date] = {
          date,
          temp: Math.round(item.main.temp),
          tempMin: Math.round(item.main.temp_min),
          tempMax: Math.round(item.main.temp_max),
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          mainWeather: item.weather[0].main,
          humidity: item.main.humidity,
          windSpeed: Math.round(item.wind.speed * 3.6),
          rain: item.rain?.['3h'] || 0,
        };
      }
    });

    return Object.values(dailyMap).slice(0, 5);
  } catch (e) {
    console.log('fetchForecast error:', e);
    return [];
  }
};

// ===== Weather Icon Emoji =====
export const getWeatherEmoji = (main) => {
  const map = {
    Clear: '☀️',
    Clouds: '⛅',
    Rain: '🌧️',
    Drizzle: '🌦️',
    Thunderstorm: '⛈️',
    Snow: '❄️',
    Mist: '🌫️',
    Fog: '🌫️',
    Haze: '🌫️',
    Dust: '💨',
    Sand: '💨',
    Smoke: '💨',
    Tornado: '🌪️',
  };
  return map[main] || '🌡️';
};

// ===== Farming Advisory =====
export const getFarmingAdvisory = (weather, t) => {
  const { mainWeather, humidity, windSpeed, temp } = weather;

  if (mainWeather === 'Rain' || mainWeather === 'Drizzle') {
    return {
      icon: '🌧️',
      title: 'Baarish Alert',
      advice: 'Aaj chhidkav mat karo. Drainage check karo. Fasal ki suraksha karo.',
      color: '#e8f0ff',
      borderColor: '#4a90d9',
    };
  }
  if (mainWeather === 'Thunderstorm') {
    return {
      icon: '⛈️',
      title: 'Toofan Chetavni',
      advice: 'Khet mein mat jao. Fasal ko surakshit karo. Bijli se door raho.',
      color: '#ffeaea',
      borderColor: '#e74c3c',
    };
  }
  if (temp > 38) {
    return {
      icon: '🌡️',
      title: 'Zyada Garmi',
      advice: 'Subah ya shaam ko kaam karo. Paudho ko paani do. Khud bhi paani piyo.',
      color: '#fff3e8',
      borderColor: '#f4a261',
    };
  }
  if (humidity > 80) {
    return {
      icon: '💧',
      title: 'Zyada Nami',
      advice: 'Fungal bimari ka khatra. Fasal mein hawaa aane do. Davai chhidko.',
      color: '#e8f5ee',
      borderColor: '#2d6a4f',
    };
  }
  if (windSpeed > 30) {
    return {
      icon: '💨',
      title: 'Tej Hawa',
      advice: 'Chhidkav mat karo. Nai fasal ko support do. Bamboo lagao.',
      color: '#fff8e8',
      borderColor: '#f4a261',
    };
  }
  return {
    icon: '✅',
    title: 'Accha Mausam',
    advice: 'Aaj khet ka kaam karne ke liye accha din hai. Sinchai aur chhidkav kar sakte ho.',
    color: '#e8f5ee',
    borderColor: '#52b788',
  };
};

// ===== Day Name =====
export const getDayName = (dateStr) => {
  const days = ['Ravivar', 'Somvar', 'Mangalvar', 'Budhvar', 'Guruvar', 'Shukravar', 'Shanivar'];
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Aaj';
  if (date.toDateString() === tomorrow.toDateString()) return 'Kal';
  return days[date.getDay()];
};
