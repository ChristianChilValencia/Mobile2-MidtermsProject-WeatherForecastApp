import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
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
export class HomePage implements OnInit {
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
    private httpClient: HttpClient,
    private commonService: CommonService,
    private actionSheetCtrl: ActionSheetController
  ) {}

  async ngOnInit() {
    await this.commonService.applySavedTheme();
    await this.loadSavedData();
    const unit = await Preferences.get({ key: 'temperatureUnit' });
    if (unit.value) this.temperatureUnit = unit.value as 'C' | 'F';
    this.cityName ? this.loadDataAndForecast() : this.getCurrentWeather();
  }

  // KUHA SA IMUNG CURRENT WEATHER 
  async getCurrentWeather() {
    console.log('Fetching current location...');
    (await this.commonService.getLocation()).subscribe({
      next: (response: any) => {
        if (response?.[0]?.name) {
          this.cityName = response[0].name;
          this.location.city = response[0].name;
          console.log('Detected City:', this.cityName);
          this.loadDataAndForecast();
        } else {
          console.error('City name not found in reverse geocoding response.');
        }
      },
      error: (error: any) => console.error('Error fetching current weather:', error),
    });
  }

  // MAU NAG 5 DAY FORECAST
  async loadForecast() {
    if (!this.cityName) {
      console.error('No city name available to load forecast!');
      return;
    }

    this.httpClient
      .get(`${API_URL}/forecast?q=${this.cityName}&appid=${API_KEY}&units=metric`)
      .subscribe({
        next: async (results: any) => {
          console.log('Forecast Data:', results);
          await Preferences.set({ key: 'dailyForecast', value: JSON.stringify(results) });
          this.forecastData = this.processForecastData(results.list);
        },
        error: (error: any) => console.error('Error fetching current forecast:', error),
      });
  }
  
  // MAU NAG LOAD SA TANAN NGA DATA SA WEATHER
  async loadData() {
    if (!this.cityName) {
      console.error('No city name available to load data!');
      return;
    }
    await Preferences.set({ key: 'cityName', value: this.cityName });
    this.httpClient
      .get(`${API_URL}/weather?q=${this.cityName}&appid=${API_KEY}&units=metric`)
      .subscribe({
        next: async (results: any) => {
          console.log(results);
          await Preferences.set({ key: 'currentWeather', value: JSON.stringify(results) });
          this.weatherTemp = this.processWeatherData(results);
          this.weatherDetails = results.weather[0];
          this.weatherIcon = `https://openweathermap.org/img/wn/${this.weatherDetails.icon}@2x.png`;
          console.log('Weather Icon URL:', this.weatherIcon);
          await this.saveDataToPreferences();
        },
        error: (error: any) => console.error('Error fetching current data:', error),
      });
  }

  //LOADAN ANG DUHA 
  private loadDataAndForecast() {
    this.loadData();
    this.loadForecast();
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

  // PROCESS DATA
  private processWeatherData(results: any): any {
    results.main.temp = this.convertTemperature(results.main.temp);
    return results;
  }

  // SA CITY NAME RANI PARA DI MA WA 
  async onCityNameChange() {
    if (!this.cityName.trim()) {
      const savedCityName = await Preferences.get({ key: 'cityName' });
      if (savedCityName.value) this.cityName = savedCityName.value;
    } else {
      await Preferences.set({ key: 'cityName', value: this.cityName });
      this.loadDataAndForecast();
    }
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
    if (!(await this.commonService.areNotificationsEnabled())) {
      console.log('Notifications are disabled. Skipping severe weather alerts.');
      return;
    }
    this.httpClient
      .get(`${API_URL}/alerts?q=${this.cityName}&appid=${API_KEY}`)
      .subscribe({
        next: (alerts: any) => {
          if (alerts?.length > 0) this.commonService.showNotification();
          else console.log('No severe weather alerts.');
        },
        error: (err) => console.error('Error fetching severe weather alerts:', err),
      });
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

  // TANNA SETTINGS OG CUSTOMIZATION
  async settingsSheet() {
    const notificationsEnabled = await this.commonService.areNotificationsEnabled();

    const settingsSheet = await this.actionSheetCtrl.create({
      header: 'Settings',
      buttons: [
        {
          text: notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications',
          icon: notificationsEnabled ? 'notifications-off-outline' : 'notifications-outline',
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
          text: 'Refresh',
          icon: 'refresh-outline',
          handler: () => window.location.reload(),
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
