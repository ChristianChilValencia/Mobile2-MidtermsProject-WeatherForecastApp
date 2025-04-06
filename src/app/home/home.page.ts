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
  threeHourForecastData: any[] = [];
  forecast: any;
  temperatureUnit: 'C' | 'F' = 'C'; // Default to Celsius
  backgroundImage = 'assets/kuyakim.jpg'; 

  constructor(
    public httpClient: HttpClient,
    private commonService: CommonService,
    private actionSheetCtrl: ActionSheetController,
  ) {}  

  async ngOnInit() {
    await this.commonService.applySavedTheme();
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

  convertTemperature(temp: number): number {
    if (this.temperatureUnit === 'F') {
      return parseFloat(((temp * 9) / 5 + 32).toFixed(1)); // Convert Celsius to Fahrenheit and round to 1 decimal place
    }
    return parseFloat(temp.toFixed(1)); // Return Celsius rounded to 1 decimal place
  }

  // async getCurrentWeather() {
  //   console.log("Fetching current location...");
  //   (await this.commonService.getLocation()).subscribe({
  //     next: (response: any) => {
  //       console.log('Reverse Geocoding Response:', response);
  //       if (response && response[0] && response[0].name) {
  //         this.cityName = response[0].name;
  //         this.location.city = response[0].name;
  //         console.log('Detected City:', this.cityName);
  //         this.loadData();
  //         // this.loadForecast();
  //       } else {
  //         console.error('City name not found in reverse geocoding response.');
  //       }
  //     },
  //     error: (error: any) => {
  //       console.error('Error fetching current weather:', error);
  //     },
  //   });
  // }

  // async loadData() {
  //   if (this.cityName) {
  //     await Preferences.set({
  //     key: 'currentWeather',
  //     value: JSON.stringify(this.weatherTemp),
  //     });

  //     // Save forecast data to Preferences (if implemented)
  //     // await Preferences.set({
  //     // key: 'dailyForecast',
  //     // value: JSON.stringify(forecastResults),
  //     // });

  //     this.httpClient.get(`${API_URL}/weather?q=${this.cityName}&appid=${API_KEY}&units=metric`).subscribe({
  //       next: async (results: any) => {
  //         console.log(results);
  //         await Preferences.set({
  //           key: 'currentWeather',
  //           value: JSON.stringify(results),
  //         });
  //         this.weatherTemp = results;
  //         this.weatherTemp.main.temp = this.convertTemperature(this.weatherTemp.main.temp); // No need to subtract 273.15 as API already provides Celsius
  //         this.weatherTemp.main.temp_max = this.convertTemperature(this.weatherTemp.main.temp_max);
  //         this.weatherTemp.main.temp_min = this.convertTemperature(this.weatherTemp.main.temp_min);
  //         this.weatherDetails = results.weather[0];
  //         this.weatherIcon = `https://openweathermap.org/img/wn/${this.weatherDetails.icon}@4x.png`;
  //         console.log('Weather Icon URL:', this.weatherIcon);
  //         await this.saveDataToPreferences(); // Save data after successful fetch
  //       },
  //       error: async (err) => {
  //         console.error('Error fetching weather data:', err);
  //         const cachedData = await Preferences.get({ key: 'currentWeather' });
  //         if (cachedData.value) {
  //           console.log('Using cached current weather data:', JSON.parse(cachedData.value));
  //           const results = JSON.parse(cachedData.value);
  //           this.weatherTemp = results;
  //           this.weatherDetails = results.weather[0];
  //           this.weatherIcon = `https://openweathermap.org/img/wn/${this.weatherDetails.icon}10d@2x.png`;
  //         }
  //       },
  //     });
  //   } else {
  //     console.error('No city name available to load data!');
  //   }
  // }

  async onCityNameChange() {
    await Preferences.set({ key: 'cityName', value: this.cityName });
    console.log('City name saved to preferences:', this.cityName);
    this.loadData();
  }


  // PERSISTANCE CACHING 
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


  // ACTION SHEETS ✅✅✅  
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
            // this.loadForecast(); // Reload forecast data
          },
        },
        {
          text: 'Refresh',
          handler: () => {
            window.location.reload();
          },
        },
        {
          text: 'Switch Theme',
          handler: async () => {
            const currentTheme = await Preferences.get({ key: 'theme' });
            if (currentTheme.value === 'dark') {
              this.commonService.enableLight(); 
            } else {
              this.commonService.enableDark(); 
            }
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });
    await settingsSheet.present();
  }





  async getCurrentWeather() {
    console.log("Fetching current location...");
    (await this.commonService.getLocation()).subscribe({
      next: (response: any) => {
        console.log('Reverse Geocoding Response:', response);

        // Extract the city name from the reverse geocoding response
        // This is the Integration bro
        if (response && response[0] && response[0].name) {
          this.cityName = response[0].name;
          this.location.city = response[0].name; // Set location.city
          console.log('Detected City:', this.cityName);

          // Load weather and forecast data for the detected city
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

  loadForecast() {
    if (this.cityName) {
      this.httpClient.get(`${API_URL}/forecast?q=${this.cityName}&appid=${API_KEY}`).subscribe({
        next: (results: any) => {
          console.log('Forecast Data:', results);
  
          // Filter to get one forecast per day (e.g., at 12:00 PM)
          this.forecastData = results.list.filter((forecast: any) => forecast.dt_txt.includes('12:00:00'));
        },
        error: (err) => {
          console.error('Error fetching forecast data:', err);
        },
      });
    } else {
      console.error('No city name available to load forecast!');
    }
  }

  loadData() {
    if (this.cityName) {
      this.httpClient.get(`${API_URL}/weather?q=${this.cityName}&appid=${API_KEY}`).subscribe({
        next: (results: any) => {
          console.log(results);
          this.weatherTemp = results;
          this.weatherDetails = results.weather[0];
          this.weatherIcon = `https://openweathermap.org/img/wn/${this.weatherDetails.icon}@2x.png`;
          console.log('Weather Icon URL:', this.weatherIcon);

           this.weatherTemp.main.temp_max = Math.round(this.weatherTemp.main.temp_max - 273.15); // Convert temperature from Kelvin to Celsius
          this.weatherTemp.main.temp_min = Math.round(this.weatherTemp.main.temp_min - 273.15); // Convert min temperature
          this.weatherTemp.main.temp = Math.round(this.weatherTemp.main.temp - 273.15); // Convert current temperature
          return this.weatherTemp;
        },
        error: (err) => {
          console.error('Error fetching weather data:', err); // Log errors if weather data fetch fails
        },
      });
    } else {
      console.error('No city name available to load data!'); // Handle case where city name is not available
    }
  }

  loadThreeHourForecast() {
    if (this.cityName) {
      this.httpClient.get(`${API_URL}/forecast?q=${this.cityName}&appid=${API_KEY}`).subscribe({
        next: (results: any) => {
          console.log('3-Hour Forecast Data:', results);

          // Extract the 3-hour interval forecast data
          this.forecastData = results.list.slice(0, 8).map((forecast: any) => ({
            time: forecast.dt_txt,
            temp: this.convertTemperature(forecast.main.temp),
            weather: forecast.weather[0],
            icon: `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`,
          }));
          console.log('Processed 3-Hour Forecast:', this.forecastData);
        },
        error: (err) => {
          console.error('Error fetching 3-hour forecast data:', err);
        },
      });
    } else {
      console.error('No city name available to load 3-hour forecast!');
    }
  }
}

