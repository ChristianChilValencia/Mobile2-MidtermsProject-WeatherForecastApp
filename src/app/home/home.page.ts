import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http'
import axios from 'axios';

const API_KEY = environment.API_KEY;
const API_URL = environment.API_URL;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  todayDate = new Date();
  weatherTemp: any;

  cityInput: string = '';
  
  async getCityLocation(): Promise<void>{
  const cityName = this.cityInput.trim();
  const value = '';

    if(cityName === ''){
      console.log("There is no City");
      return;    
    }

    

   let GEOCODING_API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=$limit={limit}$appid={API_KEY}`;


    }
  }





  // constructor(public httpClient:HttpClient) {
  //   this.loadData();
  // }
  // loadData() {
  //   this.httpClient.get(`${API_URL}/weather?q=${"cityName"}&appid=${API_KEY}`).subscribe({
  //     next: (results) => {
  //       console.log(results);
  //       this.weatherTemp = results;
  //       console.log(this.weatherTemp);
  //     },
  //     error: (err) => {
  //       console.error('Error fetching weather data:', err);
  //     }
  //   });

    
//   }
// }
