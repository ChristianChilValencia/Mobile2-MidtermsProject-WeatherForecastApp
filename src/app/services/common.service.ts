import { HttpClient } from '@angular/common/http';
import { Inject, inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Geolocation } from '@capacitor/geolocation';
import { DOCUMENT } from '@angular/common';
import { Preferences } from '@capacitor/preferences';

const API_KEY = environment.API_KEY;
const API_URL = environment.API_URL;

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  renderer: Renderer2;
  constructor(
    private http: HttpClient, 
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.renderer = this.rendererFactory.createRenderer(this.document, null);
  }

  async getLocation() {
    try {
      const position = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      return this.http.get(`http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`);
    } catch (error) {
      console.error('Error getting location:', error);
      throw error;
    }
  }

  enableDark() {
    this.renderer.addClass(this.document.body, 'dark');
    Preferences.set({ key: 'theme', value: 'dark' }); // Persist dark mode preference
  }
  
  enableLight() {
    this.renderer.removeClass(this.document.body, 'dark');
    Preferences.set({ key: 'theme', value: 'light' }); // Persist light mode preference
  }

  
  async applySavedTheme() {
    const theme = await Preferences.get({ key: 'theme' });
    if (theme.value === 'dark') {
      this.enableDark();
    } else {
      this.enableLight();
    }
  }

    // Enable notifications for severe weather alerts
    async enableNotifications() {
      await Preferences.set({ key: 'notificationsEnabled', value: 'true' });
      console.log('Notifications for severe weather alerts enabled.');
    }
  
    // Disable notifications for severe weather alerts
    async disableNotifications() {
      await Preferences.set({ key: 'notificationsEnabled', value: 'false' });
      console.log('Notifications for severe weather alerts disabled.');
    }
  
    // Check if notifications are enabled
    async areNotificationsEnabled(): Promise<boolean> {
      const { value } = await Preferences.get({ key: 'notificationsEnabled' });
      return value === 'true';
    }

    async checkForSevereWeatherAlerts() {
      const notificationsEnabled = await this.commonService.areNotificationsEnabled();
      if (!notificationsEnabled) {
        console.log('Notifications are disabled. Skipping severe weather alerts.');
        return;
      }
    
      // Logic to fetch and display severe weather alerts
      this.httpClient.get(`${API_URL}/alerts?q=${this.cityName}&appid=${API_KEY}`).subscribe({
        next: (alerts: any) => {
          if (alerts && alerts.length > 0) {
            console.log('Severe weather alerts:', alerts);
            // Display alerts to the user (e.g., using a toast or modal)
          } else {
            console.log('No severe weather alerts.');
          }
        },
        error: (err) => {
          console.error('Error fetching severe weather alerts:', err);
        },
      });
    }
}