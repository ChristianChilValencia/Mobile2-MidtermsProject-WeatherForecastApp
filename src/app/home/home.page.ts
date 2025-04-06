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
  temperatureUnit: 'C' | 'F' = 'C';
  backgroundImage = 'assets/kuyakim.jpg'; 

  constructor(
    public httpClient: HttpClient,
    private commonService: CommonService,
    private actionSheetCtrl: ActionSheetController,
  ) {}  

  async ngOnInit() {
    await this.commonService.applySavedTheme();
    await this.loadSavedData(); 
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
  
          // Filter and map forecast data
          this.forecastData = results.list
            .filter((forecast: any) => forecast.dt_txt.includes('12:00:00'))
            .map((forecast: any) => {
              // Convert temperatures to the selected unit
              forecast.main.temp = this.convertTemperature(forecast.main.temp);
              forecast.main.temp_max = this.convertTemperature(forecast.main.temp_max);
              forecast.main.temp_min = this.convertTemperature(forecast.main.temp_min);
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
  
            // Filter and map cached forecast data
            this.forecastData = results.list
              .filter((forecast: any) => forecast.dt_txt.includes('12:00:00'))
              .map((forecast: any) => {
                forecast.main.temp = this.convertTemperature(forecast.main.temp);
                forecast.main.temp_max = this.convertTemperature(forecast.main.temp_max);
                forecast.main.temp_min = this.convertTemperature(forecast.main.temp_min);
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

  async onCityNameChange() {
    if (!this.cityName || this.cityName.trim() === '') {
      const savedCityName = await Preferences.get({ key: 'cityName' });
      if (savedCityName.value) {
        this.cityName = savedCityName.value;
      }
    } else {
      await Preferences.set({ key: 'cityName', value: this.cityName });
      this.loadData();
      this.loadForecast();
    }
  }

  convertTemperature(temp: number): number {
    if (this.temperatureUnit === 'F') {
      return parseFloat(((temp * 9) / 5 + 32).toFixed(1)); 
    }
    return parseFloat(temp.toFixed(1));
  }

  async checkForSevereWeatherAlerts() {
    const notificationsEnabled = await this.commonService.areNotificationsEnabled();
    if (!notificationsEnabled) {
      console.log('Notifications are disabled. Skipping severe weather alerts.');
      return;
    }

    this.httpClient.get(`${API_URL}/alerts?q=${this.cityName}&appid=${API_KEY}`).subscribe({
      next: (alerts: any) => {
        if (alerts && alerts.length > 0) {
          this.commonService.showNotification();
        } else {
          console.log('No severe weather alerts.');
        }
      },
      error: (err) => {
        console.error('Error fetching severe weather alerts:', err);
      },
    });
  }

    // PERSISTANCE SAVING
    async saveDataToPreferences() {
      await Preferences.set({ key: 'cityName', value: this.cityName });
      await Preferences.set({ key: 'location', value: JSON.stringify(this.location) });
      console.log('Data saved to preferences.');
    }
  
    async loadSavedData() {
      const cityName = await Preferences.get({ key: 'cityName' });
      if (cityName.value) {
        this.cityName = cityName.value;
        console.log('Loaded cityName from preferences:', this.cityName);
      }
    }

  // ACTION SHEETS PARA SA SETTINGS
  async settingsSheet() {
    const notificationsEnabled = await this.commonService.areNotificationsEnabled();

    const settingsSheet = await this.actionSheetCtrl.create({
      header: 'Settings',
      buttons: [
      {
        text: notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications',
        icon: notificationsEnabled ? 'notifications-off-outline' : 'notifications-outline',
        handler: async () => {
          if (notificationsEnabled) {
            await this.commonService.disableNotifications();
          } else {
            await this.commonService.enableNotifications();
          }
        },
      },
      {
        text: `Switch to ${this.temperatureUnit === 'C' ? 'Fahrenheit' : 'Celsius'}`,
        icon: this.temperatureUnit === 'C' ? 'thermometer-outline' : 'thermometer',
        handler: async () => {
        this.temperatureUnit = this.temperatureUnit === 'C' ? 'F' : 'C';
        await Preferences.set({ key: 'temperatureUnit', value: this.temperatureUnit });
        console.log('Temperature unit switched to:', this.temperatureUnit);
        this.loadData(); 
        this.loadForecast(); 
        },
      },
      {
        text: 'Switch Theme',
        icon: 'color-palette-outline',
        handler: async () => {
        const currentTheme = await Preferences.get({ key: 'theme' });
        if (currentTheme.value === 'dark') {
          this.commonService.enableLight(); 
        } else {
          this.commonService.enableDark(); 
        }
        },
      },
      {
        text: 'Refresh',
        icon: 'refresh-outline',
        handler: () => {
        window.location.reload();
        },
      },
      {
        text: 'Cancel',
        role: 'cancel',
        icon: 'close-outline',
      },
      ],
    });
    await settingsSheet.present();
  }    
}

