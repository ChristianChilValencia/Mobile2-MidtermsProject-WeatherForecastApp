import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../services/common.service';
import { ActionSheetController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
import { Network } from '@capacitor/network';
const API_KEY = environment.API_KEY;
const API_URL = environment.API_URL;
import { App } from '@capacitor/app';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  weatherTemp: any;
  todayDate = new Date();
  weatherIcon: any;
  weatherDetails: any;
  cityName: string = '';
  displayedCityName: string = '';
  location: any = {};
  hourlyForecastData: any[] = [];
  forecastData: any[] = [];
  temperatureUnit: 'C' | 'F' = 'C';
  backgroundImage = 'assets/kuyakim.jpg';
  isOnline: boolean = true;

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService,
    private actionSheetCtrl: ActionSheetController
  ) {}

  async ngOnInit() {
    await this.commonService.applySavedTheme();
    await this.loadSavedData();
    const unit = await Preferences.get({ key: 'temperatureUnit' });
    if (unit.value) this.temperatureUnit = unit.value as 'C' | 'F';
    
    await this.checkNetworkStatus();
    this.cityName ? this.loadDataAndForecast() : this.getCurrentWeather();
    
    Network.addListener('networkStatusChange', status => {
      this.isOnline = status.connected;
      console.log('Network status changed:', status.connected ? 'online' : 'offline');
    });
  }
  
  // MO CHECK NETWORK IF OFFLINE KA O DI
  async checkNetworkStatus() {
    const status = await Network.getStatus();
    this.isOnline = status.connected;
    console.log('Current network status:', this.isOnline ? 'online' : 'offline');
    return this.isOnline;
  }
  

  // LOAD SIYA SA CACHE DATA PANG OFFLINE
  async loadCachedData() {
    console.log('Loading cached data due to offline status');
    
    const loadFromCache = async (key: string, processor?: Function) => {
      const cached = await Preferences.get({ key });
      if (cached.value) {
        const data = JSON.parse(cached.value);
        console.log(`Loaded cached ${key} data`);
        return processor ? processor(data) : data;
      }
      return null;
    };
    
    const weatherData = await loadFromCache('currentWeather');
    if (weatherData) {
      this.weatherTemp = this.processWeatherData(weatherData);
      this.weatherDetails = weatherData.weather[0];
      this.weatherIcon = `https://openweathermap.org/img/wn/${this.weatherDetails.icon}@2x.png`;
    }
    
    const forecastData = await loadFromCache('dailyForecast');
    if (forecastData) {
      this.forecastData = this.processForecastData(forecastData.list);
    }
    
    this.hourlyForecastData = await loadFromCache('hourlyForecast') || [];
  }


  async fetchData(endpoint: string, params: string): Promise<any> {
    if (!this.isOnline) {
      console.log(`Offline: Cannot fetch ${endpoint} data`);
      return null;
    }
    
    return new Promise((resolve, reject) => {
      this.httpClient
        .get(`${API_URL}/${endpoint}?${params}&appid=${API_KEY}&units=metric`)
        .subscribe({
          next: async (results: any) => {
            console.log(`${endpoint} Data:`, results);
            await Preferences.set({ key: endpoint === 'weather' ? 'currentWeather' : 
                                        endpoint === 'forecast' && params.includes('cnt=24') ? 'hourlyForecast' : 'dailyForecast', 
                                   value: JSON.stringify(results) });
            resolve(results);
          },
          error: (error: any) => {
            console.error(`Error fetching ${endpoint}:`, error);
            if (endpoint === 'weather') {
              this.commonService.presentToast('City not found. Please check the spelling.');
            }
            reject(error);
          },
        });
    });
  }


  //MO LOAD SA HOURLY FORECAST
  async loadHourlyForecast() {
    if (!this.cityName) {
      console.error('No city name available to load hourly forecast!');
      return;
    }
    
    const results = await this.fetchData('forecast', `q=${this.cityName}&cnt=24`)
      .catch(error => console.error('Error fetching hourly forecast:', error));
    
    if (results) {
      this.hourlyForecastData = results.list.slice(0, 8).map((forecast: any) => {
        return {
          time: new Date(forecast.dt * 1000),
          temp: this.convertTemperature(forecast.main.temp),
          description: forecast.weather[0].description,
          icon: forecast.weather[0].icon,
          humidity: forecast.main.humidity,
          windSpeed: forecast.wind.speed
        };
      });
      
      await Preferences.set({ key: 'hourlyForecast', value: JSON.stringify(this.hourlyForecastData) });
      console.log('Processed hourly forecast:', this.hourlyForecastData);
    }
  }


  // MO KUHA SA CURRENT WEATHER NIMU
  async getCurrentWeather() {
    if (!this.isOnline) {
      console.log('Offline: Cannot fetch current location');
      return this.loadCachedData();
    }
    
    console.log('Fetching current location...');
    (await this.commonService.getLocation()).subscribe({
      next: (response: any) => {
        if (response?.[0]?.name) {
          this.cityName = response[0].name;
          this.location.city = response[0].name;
          console.log('Detected City:', this.cityName);
          this.loadDataAndForecast().then(() => {
            this.displayedCityName = this.cityName;
          });
        } else {
          console.error('City name not found in reverse geocoding response.');
        }
      },
      error: (error: any) => console.error('Error fetching current weather:', error),
    });
  }


  //PANG LOAD SA FORECAST
  async loadForecast() {
    if (!this.cityName) {
      console.error('No city name available to load forecast!');
      return;
    }
    
    const results = await this.fetchData('forecast', `q=${this.cityName}`)
      .catch(error => console.error('Error fetching forecast:', error));
    
    if (results) {
      this.forecastData = this.processForecastData(results.list);
    }
  }


  // PANG LOAD SA TANAN DATA
  async loadData(): Promise<void> {
    if (!this.cityName) {
      console.error('No city name available to load data!');
      return;
    }
    
    await Preferences.set({ key: 'cityName', value: this.cityName });
    
    const results = await this.fetchData('weather', `q=${this.cityName}`)
      .catch(error => {
        console.error('Error fetching weather data:', error);
        return null;
      });
    
    if (results) {
      this.weatherTemp = this.processWeatherData(results);
      this.weatherDetails = results.weather[0];
      this.weatherIcon = `https://openweathermap.org/img/wn/${this.weatherDetails.icon}@2x.png`;
      console.log('Weather Icon URL:', this.weatherIcon);
      await this.saveDataToPreferences();
    }
  }


  private async loadDataAndForecast(): Promise<void> {
    await this.checkNetworkStatus();
    
    if (this.isOnline) {
      try {
        await this.loadData();
        await Promise.all([
          this.loadForecast(),
          this.loadHourlyForecast()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    } else {
      await this.loadCachedData();
      this.commonService.presentToast('You are offline. Showing cached data.');
    }
  }
  
  
  // PROCESS FORECAST
  private processForecastData(list: any[]): any[] {
    return list
      .filter((forecast: any) => forecast.dt_txt.includes('12:00:00'))
      .map((forecast: any) => {
        forecast.main.temp = this.convertTemperature(forecast.main.temp);
        return forecast;
      });
  }


  // PROCESS DATA SA WEATHER OG MA CONVERTED SHA
  private processWeatherData(results: any): any {
    results.main.temp = this.convertTemperature(results.main.temp);
    return results;
  }


  // SA CITY NAME RANI PARA DI MA WA 
  async onCityNameChange() {
    // Don't restore the previous value when clearing - only save non-empty values
    if (this.cityName.trim()) {
      await Preferences.set({ key: 'cityName', value: this.cityName });
    }
    // Remove automatic data loading here to prevent dynamic updates
  }


  // CONVERT FARENHEIT O CELCIUS
  convertTemperature(temp: number): number {
    if (this.temperatureUnit === 'F') {
      return parseFloat(((temp * 9) / 5 + 32).toFixed(1));
    } else {
      return parseFloat(temp.toFixed(1));
    }
  }


  // MO CHECK WEATHER ALERTS
  async checkForSevereWeatherAlerts() {
    if (!(await this.commonService.areNotificationsEnabled()) || !this.isOnline) {
      console.log('Notifications are disabled or offline. Skipping severe weather alerts.');
      return;
    }
    
    try {
      const alerts: any = await this.fetchData('alerts', `q=${this.cityName}`);
      if (alerts?.length > 0) this.commonService.showNotification();
      else console.log('No severe weather alerts.');
    } catch (err) {
      console.error('Error fetching severe weather alerts:', err);
    }
  }


  // PANG PREFERENCES NA MO SAVE TANAN
  async saveDataToPreferences() {
    await Preferences.set({ key: 'cityName', value: this.cityName });
    await Preferences.set({ key: 'location', value: JSON.stringify(this.location) });
    console.log('Data saved to preferences.');
  }


  // PARA IG ABRI MO LOAD SHA LAHUS
  async loadSavedData() {
    const cityName = await Preferences.get({ key: 'cityName' });
    if (cityName.value) {
      this.cityName = cityName.value;
      console.log('Loaded cityName from preferences:', this.cityName);
    }
  }


  // TANAN SETTINGS OG CUSTOMIZATION
  async settingsSheet() {
    const notificationsEnabled = await this.commonService.areNotificationsEnabled();
    await this.checkNetworkStatus();

    const settingsSheet = await this.actionSheetCtrl.create({
      header: 'Settings',
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications',
          icon: notificationsEnabled ? 'notifications-off-outline' : 'notifications-outline',
          cssClass: 'blue-text',
          handler: async () => {
            notificationsEnabled
              ? await this.commonService.disableNotifications()
              : await this.commonService.enableNotifications();
          },
        },
        {
          text: `Switch to ${this.temperatureUnit === 'C' ? 'Fahrenheit' : 'Celsius'}`,
          icon: this.temperatureUnit === 'C' ? 'thermometer-outline' : 'thermometer',
          handler: async () => {
            this.temperatureUnit = this.temperatureUnit === 'C' ? 'F' : 'C';
            await Preferences.set({ key: 'temperatureUnit', value: this.temperatureUnit });
            console.log('Temperature unit switched to:', this.temperatureUnit);
            this.loadDataAndForecast();
          },
        },
        {
          text: 'Switch Theme',
          icon: 'color-palette-outline',
          handler: async () => {
            const currentTheme = await Preferences.get({ key: 'theme' });
            currentTheme.value === 'dark'
              ? this.commonService.enableLight()
              : this.commonService.enableDark();
          },
        },
        {
          text: `Refresh ${!this.isOnline ? '(Offline Mode)' : ''}`,
          icon: 'refresh-outline',
          handler: async () => {
            if (this.isOnline) {
              window.location.reload();
            } else {
              this.loadCachedData();
              this.commonService.presentToast('Refreshed with cached data (offline mode)');
            }
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


  // PARA IG SEARCH CITY 
  searchCity() {
    if (!this.cityName.trim()) {
      this.commonService.presentToast('Please enter a city name');
      return;
    }
    
    // LOAD SA DATA OG FORECAST
    this.loadDataAndForecast().then(() => {
      if (this.weatherTemp) {
        this.displayedCityName = this.cityName;
      }
    });
  }


  // PARA RA SURE IG SEARCH BA
  get safeDisplayName(): string {
    return this.displayedCityName || this.cityName || '';
  }
  

  // FINALLY MO EXIT SA APP
  async exitApp() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Are you sure you want to exit?',
      buttons: [
        {
          text: 'Yes, Exit',
          role: 'destructive',
          icon: 'exit-outline',
          handler: () => {
            window.close();
            App.exitApp();
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          icon: 'close-outline',
        },
      ],
    });
    await actionSheet.present();

  }

}
