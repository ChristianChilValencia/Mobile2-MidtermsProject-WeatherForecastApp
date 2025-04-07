import { HttpClient } from '@angular/common/http';
import { Inject, inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
<<<<<<< HEAD
import { environment } from '../../environments/environment';
=======
import { environment } from 'src/environments/environment';
>>>>>>> 45d9c574b2b82df770ec3ca0505d9215141173bb
import { Geolocation } from '@capacitor/geolocation';
import { DOCUMENT } from '@angular/common';
import { Preferences } from '@capacitor/preferences';

const API_KEY = environment.API_KEY;
const API_URL = environment.API_URL;

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  // RENDERING PARA THEMES
  renderer: Renderer2;
  constructor(
    private http: HttpClient, 
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.renderer = this.rendererFactory.createRenderer(this.document, null);
  }

  // KUHAG LOCATION 
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


  // PA DARK OG LIGHT MODE
  enableDark() {
    this.renderer.addClass(this.document.body, 'dark');
    Preferences.set({ key: 'theme', value: 'dark' }); 
  }

  enableLight() {
    this.renderer.removeClass(this.document.body, 'dark');
    Preferences.set({ key: 'theme', value: 'light' });
  }

  //APPLYUN ANG THEME
  async applySavedTheme() {
    const theme = await Preferences.get({ key: 'theme' });
    if (theme.value === 'dark') {
      this.enableDark();
    } else {
      this.enableLight();
    }
  }

  // PANG NOTIFICATION
  async enableNotifications() {
    await Preferences.set({ key: 'notificationsEnabled', value: 'true' });
    console.log('Notifications for severe weather alerts enabled.');
  }

  async disableNotifications() {
    await Preferences.set({ key: 'notificationsEnabled', value: 'false' });
    console.log('Notifications for severe weather alerts disabled.');
  }

  // CHECK IF ENABLED ANG NOTIF
  async areNotificationsEnabled(): Promise<boolean> {
    const { value } = await Preferences.get({ key: 'notificationsEnabled' });
    return value === 'true';
  }

  // PAKITA ALERT SA NOTIFICATION
  async showNotification() {
    const notificationsEnabled = await this.areNotificationsEnabled();
    if (notificationsEnabled) {
      const notification = new Notification('Weather Alert', {
        body: 'Severe weather conditions detected in your area. Stay safe!',
        icon: 'alert-circle-outline'
      });
      notification.onclick = () => {
        console.log('Notification clicked!');
      };
    } else {
      console.log('Notifications are disabled.');
    }
  }
}