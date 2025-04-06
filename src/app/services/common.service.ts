import { HttpClient } from '@angular/common/http';
import { Inject, inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Geolocation } from '@capacitor/geolocation';
import { DOCUMENT } from '@angular/common';

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

  enableDark(){
    this.renderer.addClass(this.document.body, 'dark');
  }

  enableLight() {
    this.renderer.removeClass(this.document.body, 'dark'); // Fix typo here
  }

}