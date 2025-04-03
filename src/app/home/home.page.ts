import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import { HttpClient, HttpClientModule } from '@angular/common/http';

const API_KEY = environment.API_KEY;
const API_URL = environment.API_URL;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  // darkMode = false;
  todayTime = new Date();
  todayDate = new Date();
  weatherTemp: any
  cityInput: any
  // name = "";
  
  weatherIcon: any
  weatherDetails: any
  
  // ngOnInit(): void{
  //   console.log('Environment:', environment);
  //   this.checkAppMode();
  // }

  // async checkAppMode() {
  //   // const checkIsDarkMode = localStorage.getItem('darkModeActivated');
  //   const checkIsDarkMode = await Preferences.get({key: 'darkModeActivated'});
  //   console.log(checkIsDarkMode);
  //   checkIsDarkMode?.value == 'true'
  //     ? (this.darkMode = true)
  //     : (this.darkMode = false);
  //   document.body.classList.toggle('dark', this.darkMode);
  // }
  // toggleDarkMode() {
  //   this.darkMode = !this.darkMode;
  //   document.body.classList.toggle('dark', this.darkMode);
  //   if(this.darkMode) {
  //     Preferences.set({key: 'darkModeActivated', value: 'true'}); 
  //   } else {
  //     // localStorage.setItem('darkModeActivated', 'false');
  //     Preferences.set({key: 'darkModeActivated', value: 'false'});
  //   }
  // }

  // //👉 MO CHECK IF UNSA SHA DAAN DARK OR LIGHT BA ANG THEME
  // async checkAppTheme(){
  //   const checkAppTheme = await Preferences.get({key: 'themeActivated'});
  //   console.log(checkAppTheme.value);
  //   checkAppTheme?.value == 'true'
  //     ? (this.checkAppTheme = true)
  //     : (this.checkAppTheme = false);

  //   document.body.classList.toggle('dark', this.checkAppTheme);
  // }

  // //👉 THEME TOGGLE FOR DARK MODE & LIGHT MODE
  // toggleTheme(){
  //   this.themeMode = !this.themeMode;
  //   document.body.classList.toggle('dark', this.themeMode);
  //   if(!this.themeMode){
  //     Preferences.set({key:'themeActivated',value: 'true'});
  //   }else{
  //     Preferences.set({key:'themeActivated',value: 'false'});
  //   }
  // }

  //🌥️ WEATHER APP FUNCTIONS
  // async getCityLocation(): Promise<void>{
  // const cityName = this.cityInput.trim();
  // const value = '';

  //   if(cityName === ''){
  //     console.log("There is no City");
  //     return;    
  //   }
  
  //  let GEOCODING_API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=$limit={limit}$appid={API_KEY}`;

  constructor(public HttpClient:HttpClient) {
    this.loadData();
  }
  
  loadData() {
      this.HttpClient.get(`${API_URL}/weather?q=${"davao"}&appid=${API_KEY}`).subscribe( results=> {
        console.log(results);
        this.weatherTemp = results
        this.cityInput = results
        this.weatherDetails = results
            console.log(this.weatherDetails);

          this.weatherIcon = `https://openweathermap.org/img/wn/${this.weatherDetails.weather[0].icon}@2x.png`;
        });
      }
  }