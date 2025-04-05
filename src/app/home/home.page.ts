import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@capacitor/geolocation';
import { CommonService } from '../services/common.service';
import { Storage } from '@capacitor/storage';
import { ActionSheetController } from '@ionic/angular';

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

  constructor(
    public httpClient: HttpClient,
    private commonService: CommonService,
    private actionSheetCtrl: ActionSheetController,
  ) {}

  ngOnInit() {
    this.getCurrentWeather();
  }

  async settingsSheet(){
    const settingsSheet = await this.actionSheetCtrl.create({
      header: 'Settings',
      buttons: [
        {
          text: 'Change Celsius to Fahrenheit',
          handler: () => {
            // this.getCurrentWeather();
            console.log("Change Celsius to Fahrenheit");
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

  async loadHourlyForecast() {
    if (this.cityName) {
      this.httpClient.get(`${API_URL}/forecast?q=${this.cityName}&appid=${API_KEY}&units=metric`).subscribe({
        next: async (results: any) => {
          console.log('Forecast Data:', results);
          await Storage.set({
            key: 'hourlyForecast',
            value: JSON.stringify(results),
          });
          const today = new Date().toISOString().split('T')[0];
          this.forecastData = results.list.filter((forecast: any) => {
            const forecastDate = forecast.dt_txt.split(' ')[0];
            return forecastDate === today;
          });
          console.log('Hourly Forecast for Today:', this.forecastData);
        },
        error: async (err) => {
          console.error('Error fetching hourly forecast data:', err);
          const cachedData = await Storage.get({ key: 'hourlyForecast' });
          if (cachedData.value) {
            console.log('Using cached hourly forecast data:', JSON.parse(cachedData.value));
            const results = JSON.parse(cachedData.value);
            const today = new Date().toISOString().split('T')[0];
            this.forecastData = results.list.filter((forecast: any) => {
              const forecastDate = forecast.dt_txt.split(' ')[0];
              return forecastDate === today;
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
          await Storage.set({
            key: 'dailyForecast',
            value: JSON.stringify(results),
          });
          this.forecastData = results.list.filter((forecast: any) => {
            return forecast.dt_txt.includes('12:00:00');
          });
          console.log('Daily Forecast:', this.forecastData);
        },
        error: async (err) => {
          console.error('Error fetching daily forecast data:', err);
          const cachedData = await Storage.get({ key: 'dailyForecast' });
          if (cachedData.value) {
            console.log('Using cached daily forecast data:', JSON.parse(cachedData.value));
            const results = JSON.parse(cachedData.value);
            this.forecastData = results.list.filter((forecast: any) => {
              return forecast.dt_txt.includes('12:00:00');
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
      this.httpClient.get(`${API_URL}/weather?q=${this.cityName}&appid=${API_KEY}`).subscribe({
        next: async (results: any) => {
          console.log(results);
          await Storage.set({
            key: 'currentWeather',
            value: JSON.stringify(results),
          });
          this.weatherTemp = results;
          this.weatherDetails = results.weather[0];
          this.weatherIcon = `https://openweathermap.org/img/wn/${this.weatherDetails.icon}@2x.png`;
          console.log('Weather Icon URL:', this.weatherIcon);
          this.weatherTemp.main.temp_max = Math.round(this.weatherTemp.main.temp_max - 273.15);
          this.weatherTemp.main.temp_min = Math.round(this.weatherTemp.main.temp_min - 273.15);
        },
        error: async (err) => {
          console.error('Error fetching weather data:', err);
          const cachedData = await Storage.get({ key: 'currentWeather' });
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
}
