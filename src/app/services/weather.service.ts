import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private apiKey = environment.API_KEY;
  private apiUrl = environment.API_URL;

  constructor(private http: HttpClient) {}

  getCurrentWeather(location: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/weather?q=${location}&appid=${this.apiKey}`);
  }

  getForecast(location: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/forecast?q=${location}&appid=${this.apiKey}`);
  }
}
