import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

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
  cityName: string = 'Cebu'; 

  constructor(public httpClient: HttpClient) {}

  loadData() {
    if (!this.cityName) {
      console.error('City name is empty!');
      return;
    }

    this.httpClient.get(`${API_URL}/weather?q=${this.cityName}&appid=${API_KEY}`).subscribe({
      next: (results: any) => {
        console.log(results);

        this.weatherTemp = results;

        this.weatherDetails = results.weather[0];

        this.weatherIcon = `https://openweathermap.org/img/wn/${this.weatherDetails.icon}@2x.png`;

        console.log('Weather Icon URL:', this.weatherIcon);
      },
      error: (err) => {
        console.error('Error fetching weather data:', err);
      },
    });
  }
}