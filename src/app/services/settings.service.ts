import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
const API_KEY = environment.API_KEY;
const API_URL = environment.API_URL;
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private temperatureUnit: 'Celsius' | 'Fahrenheit' = 'Celsius';
  private notificationsEnabled: boolean = true;
  private theme: 'light' | 'dark' = 'light';

  constructor() {}

  getTemperatureUnit() {
    return this.temperatureUnit;
  }

  setTemperatureUnit(unit: 'Celsius' | 'Fahrenheit') {
    this.temperatureUnit = unit;
  }

  areNotificationsEnabled() {
    return this.notificationsEnabled;
  }

  setNotificationsEnabled(enabled: boolean) {
    this.notificationsEnabled = enabled;
  }

  getTheme() {
    return this.theme;
  }

  setTheme(theme: 'light' | 'dark') {
    this.theme = theme;
  }
  
}
