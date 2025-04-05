import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Geolocation } from '@capacitor/geolocation';

const API_KEY = environment.API_KEY;
const API_URL = environment.API_URL;

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  constructor(private http: HttpClient) {}

  async getLocation() {
    try {
      // Get the user's current position
      const position = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = position.coords;

      // Use reverse geocoding to get the city name
      return this.http.get(`http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`);
    } catch (error) {
      console.error('Error getting location:', error);
      throw error;
    }
  }
}