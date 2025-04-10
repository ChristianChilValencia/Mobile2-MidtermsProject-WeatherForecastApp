import { HttpClient } from '@angular/common/http';
import { Inject, inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { environment } from '../../environments/environment';
import { Geolocation } from '@capacitor/geolocation';
import { DOCUMENT } from '@angular/common';
import { Preferences } from '@capacitor/preferences';
import { LoadingController } from '@ionic/angular';
const API_KEY = environment.API_KEY;
const API_URL = environment.API_URL;

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  // RENDERING PARA THEMES SA CSS
  renderer: Renderer2;
  constructor(
    private http: HttpClient, 
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document,
    private loadingController: LoadingController
  ) {
    this.renderer = this.rendererFactory.createRenderer(this.document, null);
  }

  // KUHAG LOCATION 
  async getLocation() {
    try {
      const permissionStatus = await Geolocation.checkPermissions();
      console.log('Location permission status:', permissionStatus.location);
    
      if (permissionStatus.location !== 'granted') {
        console.log('Requesting location permissions...');
        const requestResult = await Geolocation.requestPermissions();
        console.log('Permission request result:', requestResult.location);

      if (requestResult.location !== 'granted') {
        throw new Error('Location permission denied');
    }
  }
    
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 10000
    });
    
    const { latitude, longitude } = position.coords;
    console.log(`Location obtained: [${latitude}, ${longitude}]`);
    
    // Use HTTPS for API calls from mobile
    return this.http.get(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`);
  } catch (error) {
    console.error('Error getting location:', error);
    throw error;
  }
}

  // TUNG MESSAGE MO GAWAS NA GAMAY KUNG WAY NETWORK SAYUP GI BUTANG NA CITY
  async presentToast(message: string) {
    const toast = document.createElement('ion-toast');
    toast.message = message;
    toast.duration = 2000;
    document.body.appendChild(toast);
    await toast.present();
  }

  // PAND DARK OG LIGHT THEME
  async enableDark() {
  document.body.classList.add('dark');
  await Preferences.set({ key: 'theme', value: 'dark' });
  console.log('Dark theme enabled');
  }

  async enableLight() {
    document.body.classList.remove('dark');
    await Preferences.set({ key: 'theme', value: 'light' });
    console.log('Light theme enabled');
  }

  //ANG MO APPLY SA THEME
  async applySavedTheme() {
    const theme = await Preferences.get({ key: 'theme' });
    if (theme.value === 'dark') {
      document.body.classList.add('dark');
      console.log('Applied saved dark theme');
    } else {
      document.body.classList.remove('dark');
      console.log('Applied saved light theme');
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

  
  // PANG LOADING
  async presentLoading(message: string = 'Please wait...') {
    const loading = await this.loadingController.create({
      message: message,
      duration: 30000,
    });
    await loading.present();
    return loading;
  }
  
  // DISMISS SA LOADING
  async dismissLoading() {
    try {
      return await this.loadingController.dismiss();
    } catch (error) {
      return null;
    }
  }
}