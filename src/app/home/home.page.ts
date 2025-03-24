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

  constructor(){}
  // constructor(public httpClient:HttpClient) {}

  //   loadWeather(city: string) {
  //   this.httpClient.get(`${API_URL}weather?q=${city}&appid=${API_KEY}`).subscribe((data) => {
  //     console.log(data);
  //   });

}
