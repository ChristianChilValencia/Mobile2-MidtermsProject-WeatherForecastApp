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
  cityName: string = 'location.city';
  location: any;
  forecastData: any[] = [];

  constructor(public httpClient: HttpClient, private commonService:CommonService) {}

  ngOnInit() {
    this.getCurrentWeather();
  }

  getCurrentWeather(){
    console.log("Welcome to the city of", this.cityName); // Log the city name to the console
    this.commonService.getLocation().subscribe((response) => {
      console.log('Location Response:', response); // Log the response for debugging
      this.location = response; // Update the location property with the city name
      this.cityName = this.location.city; // Set cityName to the default value from location.city
      this.loadData(); // Load weather data for the default city
      this.loadForecast(); // Load forecast data for the default city
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
          this.weatherTemp = results; // Store weather data
          this.weatherDetails = results.weather[0]; // Extract weather details
          this.weatherIcon = `https://openweathermap.org/img/wn/${this.weatherDetails.icon}@2x.png`; // Generate weather icon URL
          console.log('Weather Icon URL:', this.weatherIcon);
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