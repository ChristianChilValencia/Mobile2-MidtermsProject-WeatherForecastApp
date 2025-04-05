import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@capacitor/geolocation';
import { CommonService } from '../services/common.service';

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

  constructor(public httpClient: HttpClient, private commonService:CommonService) {}

  ngOnInit() {
    this.getCurrentWeather();
  }

  // API JSON WEATHER DATA INSTEAD OF GEOLOCATION
  // getCurrentWeather(){
  //   console.log("Welcome to the city of", this.cityName); // Log the city name to the console
  //   this.commonService.getLocation().subscribe((response) => {
  //     console.log('Location Response:', response); // Log the response for debugging
  //     this.location = response; // Update the location property with the city name
  //     this.cityName = this.location.city; // Set cityName to the default value from location.city
  //     this.loadData(); // Load weather data for the default city
  //     this.loadForecast(); // Load forecast data for the default city
  //   });
  // }

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
          this.forecastData = results.list.filter((_: any, index: number) => index % 8 === 0); // Get one forecast per day
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
          this.forecast.main.temp = Math.round(this.weatherTemp.main.temp - 273.15); // Convert current temperature
        },
        error: (err) => {
          console.error('Error fetching weather data:', err); // Log errors if weather data fetch fails
        },
      });
    } else {
      console.error('No city name available to load data!'); // Handle case where city name is not available
    }
  }


}