import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@capacitor/geolocation';
import { CommonService } from '../services/common.service';
import { ActionSheetController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';

const API_KEY = environment.API_KEY;
const API_URL = environment.API_URL;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  weatherTemp: any;
  todayDate = new Date();
  weatherIcon: any;
  weatherDetails: any;
  cityName: string = '';
  location: any = {};
  forecastData: any[] = [];
  forecast: any;
  temperatureUnit: 'C' | 'F' = 'C'; // Default to Celsius

  constructor(
    public httpClient: HttpClient,
    private commonService: CommonService,
    private actionSheetCtrl: ActionSheetController,
  ) {}

  async ngOnInit() {
    await this.loadSavedData(); // Load saved cityName, temperature unit, and other data
    const unit = await Preferences.get({ key: 'temperatureUnit' });
    if (unit.value) {
      this.temperatureUnit = unit.value as 'C' | 'F';
    }
    if (this.cityName) {
      this.loadData();
      this.loadForecast();
    } else {
      this.getCurrentWeather();
    }
  }

  async settingsSheet() {
    const settingsSheet = await this.actionSheetCtrl.create({
      header: 'Settings',
      buttons: [
        {
          text: `Switch to ${this.temperatureUnit === 'C' ? 'Fahrenheit' : 'Celsius'}`,
          handler: async () => {
            this.temperatureUnit = this.temperatureUnit === 'C' ? 'F' : 'C';
            await Preferences.set({ key: 'temperatureUnit', value: this.temperatureUnit });
            console.log('Temperature unit switched to:', this.temperatureUnit);
            this.loadData(); // Reload current weather data
            this.loadForecast(); // Reload forecast data
          },
        },
        {
          text: 'Refresh',
          handler: () => {
            window.location.reload();
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });
    await settingsSheet.present();
  }

  convertTemperature(temp: number): number {
    if (this.temperatureUnit === 'F') {
      return parseFloat(((temp * 9) / 5 + 32).toFixed(1)); // Convert Celsius to Fahrenheit and round to 1 decimal place
    }
    return parseFloat(temp.toFixed(1)); // Return Celsius rounded to 1 decimal place
  }

  async loadHourlyForecast() {
    if (this.cityName) {
      this.httpClient.get(`${API_URL}/forecast?q=${this.cityName}&appid=${API_KEY}&units=metric`).subscribe({
        next: async (results: any) => {
          console.log('Hourly Forecast Data:', results);
          await Preferences.set({
            key: 'hourlyForecast',
            value: JSON.stringify(results),
          });
          const today = new Date().toISOString().split('T')[0];
          this.forecastData = results.list
            .filter((forecast: any) => forecast.dt_txt.split(' ')[0] === today)
            .map((forecast: any) => {
              forecast.main.temp = this.convertTemperature(forecast.main.temp - 273.15);
              return forecast;
            });
          console.log('Hourly Forecast for Today:', this.forecastData);
        },
        error: async (err) => {
          console.error('Error fetching hourly forecast data:', err);
          const cachedData = await Preferences.get({ key: 'hourlyForecast' });
          if (cachedData.value) {
            console.log('Using cached hourly forecast data:', JSON.parse(cachedData.value));
            const results = JSON.parse(cachedData.value);
            const today = new Date().toISOString().split('T')[0];
            this.forecastData = results.list
              .filter((forecast: any) => forecast.dt_txt.split(' ')[0] === today)
              .map((forecast: any) => {
                forecast.main.temp = this.convertTemperature(forecast.main.temp - 273.15);
                return forecast;
              });
          }
        },
      });
    } else {
      console.error('No city name available to load hourly forecast!');
    }
  }

  async getCurrentWeather() {
    console.log("Fetching current location...");
    (await this.commonService.getLocation()).subscribe({
      next: (response: any) => {
        console.log('Reverse Geocoding Response:', response);
        if (response && response[0] && response[0].name) {
          this.cityName = response[0].name;
          this.location.city = response[0].name;
          console.log('Detected City:', this.cityName);
          this.loadData();
          this.loadForecast();
        } else {
          console.error('City name not found in reverse geocoding response.');
        }
      },
      error: (error: any) => {
        console.error('Error fetching current weather:', error);
      },
    });
  }

  async loadForecast() {
    if (this.cityName) {
      this.httpClient.get(`${API_URL}/forecast?q=${this.cityName}&appid=${API_KEY}&units=metric`).subscribe({
        next: async (results: any) => {
          console.log('Forecast Data:', results);
          await Preferences.set({
            key: 'dailyForecast',
            value: JSON.stringify(results),
          });
          this.forecastData = results.list
            .filter((forecast: any) => forecast.dt_txt.includes('12:00:00'))
            .map((forecast: any) => {
              forecast.main.temp = this.convertTemperature(forecast.main.temp); // No need to subtract 273.15 as API already provides Celsius
              return forecast;
            });
          console.log('Daily Forecast:', this.forecastData);
        },
        error: async (err) => {
          console.error('Error fetching daily forecast data:', err);
          const cachedData = await Preferences.get({ key: 'dailyForecast' });
          if (cachedData.value) {
            console.log('Using cached daily forecast data:', JSON.parse(cachedData.value));
            const results = JSON.parse(cachedData.value);
            this.forecastData = results.list
              .filter((forecast: any) => forecast.dt_txt.includes('12:00:00'))
              .map((forecast: any) => {
                forecast.main.temp = this.convertTemperature(forecast.main.temp);
                return forecast;
              });
          }
        },
      });
    } else {
      console.error('No city name available to load forecast!');
    }
  }

  async loadData() {
    if (this.cityName) {
      // Save the cityName to Preferences whenever it is updated
      await Preferences.set({ key: 'cityName', value: this.cityName });

      this.httpClient.get(`${API_URL}/weather?q=${this.cityName}&appid=${API_KEY}&units=metric`).subscribe({
        next: async (results: any) => {
          console.log(results);
          await Preferences.set({
            key: 'currentWeather',
            value: JSON.stringify(results),
          });
          this.weatherTemp = results;
          this.weatherTemp.main.temp = this.convertTemperature(this.weatherTemp.main.temp); // No need to subtract 273.15 as API already provides Celsius
          this.weatherTemp.main.temp_max = this.convertTemperature(this.weatherTemp.main.temp_max);
          this.weatherTemp.main.temp_min = this.convertTemperature(this.weatherTemp.main.temp_min);
          this.weatherDetails = results.weather[0];
          this.weatherIcon = `https://openweathermap.org/img/wn/${this.weatherDetails.icon}@2x.png`;
          console.log('Weather Icon URL:', this.weatherIcon);
          await this.saveDataToPreferences(); // Save data after successful fetch
        },
        error: async (err) => {
          console.error('Error fetching weather data:', err);
          const cachedData = await Preferences.get({ key: 'currentWeather' });
          if (cachedData.value) {
            console.log('Using cached current weather data:', JSON.parse(cachedData.value));
            const results = JSON.parse(cachedData.value);
            this.weatherTemp = results;
            this.weatherDetails = results.weather[0];
            this.weatherIcon = `https://openweathermap.org/img/wn/${this.weatherDetails.icon}@2x.png`;
          }
        },
      });
    } else {
      console.error('No city name available to load data!');
    }
  }

  async saveDataToPreferences() {
    await Preferences.set({ key: 'cityName', value: this.cityName });
    await Preferences.set({ key: 'location', value: JSON.stringify(this.location) });
    console.log('Data saved to preferences.');
  }

  async onCityNameChange() {
    // Save the updated cityName to Preferences
    await Preferences.set({ key: 'cityName', value: this.cityName });
    console.log('City name saved to preferences:', this.cityName);

    // Load weather data and forecast for the updated cityName
    this.loadData();
    this.loadForecast();
  }

  async loadSavedData() {
    const cityName = await Preferences.get({ key: 'cityName' });
    if (cityName.value) {
      this.cityName = cityName.value;
      console.log('Loaded cityName from preferences:', this.cityName);
    }
  }
}
