import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
<<<<<<< HEAD
import { environment } from '../environments/environment';
import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
=======
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import axios from 'axios';
>>>>>>> 45d9c574b2b82df770ec3ca0505d9215141173bb

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor() {}
}
