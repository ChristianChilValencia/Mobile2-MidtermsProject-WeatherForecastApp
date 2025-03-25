import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http'
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
  // constructor(public httpClient:HttpClient) {
  //   this.loadData();
  // }
  // loadData() {
  //   this.httpClient.get(`${API_URL}/weather?q=Cebu&appid=${API_KEY}`).subscribe({
  //     next: (results) => {
  //       console.log(results);
  //       this.weatherTemp = results;
  //       console.log(this.weatherTemp);
  //     },
  //     error: (err) => {
  //       console.error('Error fetching weather data:', err);
  //     }
  //   });
  // }
}
