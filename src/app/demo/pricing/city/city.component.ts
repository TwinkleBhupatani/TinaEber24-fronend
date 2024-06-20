import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { CityService } from '../../../services/city.service';
import {SessionService} from '../../../services/session.service'

declare var google: any;

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss']
})
export class CityComponent implements OnInit {
  form = {
    countryid: '',
    city: '',
    latlng: '',
  }
  countryList: any[] = [];
  cityList: any[] = [];
  isEdit = false;
  selectedCity: any = {};
  map: any;
  marker: any;
  input: any;
  autocomplete: any;
  selectedCountry: string;
  drawnPolygon: any;
  successMessage: any;
  errorMessage: any;
  polygons: any;
  markers: any;

  constructor(private cityService: CityService, private SessionService: SessionService) { }
  @ViewChild('cityInput') cityInput: any;

  @HostListener('window:keydown')
  onKeydown(): void {
    this.SessionService.resetSessionTimer();
  }

  @HostListener('window:mousemove')
  onUserActivity(): void {
    this.SessionService.resetSessionTimer();
  }

  ngOnInit(): void { 
    this.initMap();
    this.loadAllCountries();
    this.setUpDrawingManager();
  }

  initMap() {
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: 45.7749, lng: -122.4194 },
      zoom: 4,
    });

  }

  loadAllCountries() {
    this.cityService.fetchCountries().subscribe(
      (response) => {
        this.countryList = response;
        console.log("country list",this.countryList)
      },
      (error) => { 
        console.error("Error Fetching country list:", error);
      }
    )
  }

  onCountryChange() {
    this.isEdit=false;
    this.selectedCity._id='';
  
    const country = this.countryList.find((country) => country.country === this.selectedCountry);
    //this.isEdit = false;
    if (country) {
      const countryCode = country.countryCode;
      this.form.countryid = country._id;

      this.map.setCenter({
        lat: country.lat,
        lng: country.lng
      });
      this.map.setZoom(5);
      if (this.autocomplete) {
        google.maps.event.clearInstanceListeners(this.input);
        google.maps.event.clearInstanceListeners(this.autocomplete);
        this.autocomplete.unbindAll();
        this.input.value = '';
        this.marker.setMap(null);
      }
      this.input = document.getElementById('autocomplete-input');

      const options = {
        componentRestrictions: {
          country: countryCode,
        },
        types: ['(cities)']
      };
      this.autocomplete = new google.maps.places.Autocomplete(this.input, options);

      this.autocomplete.addListener('place_changed', () => {
        const place = this.autocomplete.getPlace();
        // console.log('Autocomplete Result:', place);
        if (this.marker) {
          this.marker.setMap(null);
        }

        if (place.geometry) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();

          this.map.setCenter({ lat: lat, lng: lng });
          this.map.setZoom(7);

          this.marker = new google.maps.Marker({
            position: {
              lat: lat,
              lng: lng
            },
            map: this.map,
            draggable: true,
            animation: google.maps.Animation.DROP
          });
        }
      });
      this.cityService.getAllCitiesByCountry(this.form.countryid).subscribe(
        (response) => {
          this.cityList = response;
          // console.log(this.cityList);
          this.displayPolygonsOnMap(this.cityList)
        },
        (error) => {
          console.error('Error loading city list:', error);
        }
      );
    }

  }

  displayPolygonsOnMap(cityList: any) {

    this.clearPolygonsAndMarkers();

    cityList.forEach(city => {
      const latLngValues = city.latlng;
      // console.log('LatLng Values in for loop:', latLngValues);
      const polygon = new google.maps.Polygon({
        paths: latLngValues,
        map: this.map,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
      });
      this.polygons.push(polygon);
      const firstPoint = latLngValues[0];
      this.marker = new google.maps.Marker({
        position: {
          lat: firstPoint.lat,
          lng: firstPoint.lng,
        },
        map: this.map,
        title: city.city,
      });
      this.markers.push(this.marker);
    });
  }

  clearPolygonsAndMarkers() {
    if (this.polygons) {
      this.polygons.forEach(polygon => {
        polygon.setMap(null);
      });
    }

    if (this.markers) {
      this.markers.forEach(marker => {
        marker.setMap(null);
      });
    }

    this.polygons = [];
    this.markers = [];
  }


  setUpDrawingManager() {
    const drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          google.maps.drawing.OverlayType.POLYGON,
        ]
      },
      polygonOptions: {
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
      },
    });
    drawingManager.setMap(this.map);
    google.maps.event.addListener(drawingManager, 'overlaycomplete', (event: any) => {
      // console.log('Overlay Complete Event:', event);
      if (event.type === google.maps.drawing.OverlayType.POLYGON) {
        // console.log('Polygon Drawn:', event.overlay);
        this.drawnPolygon = event.overlay;
        this.processDrawnPolygon();
      }
    });

  }

  processDrawnPolygon() {
    if (this.drawnPolygon) {
      const paths = this.drawnPolygon.getPaths();
      const coordinates = paths.getAt(0).getArray();

      // console.log('Drawn Polygon Coordinates:', coordinates);

      this.form.latlng = coordinates.map((latLng) => ({
        lat: latLng.lat(),
        lng: latLng.lng(),
      }));
    }
  }


  editZone(city: any) {
    // this.clearDrawnPolygon();
    // this.clearPolygonsAndMarkers();
    this.selectedCity = { ...city };
    this.form.city = this.selectedCity.city;
    // console.log("selected city", this.form);
    this.isEdit = true;
    this.marker.setMap(null);
    this.displayPolygonsOnMap([this.selectedCity]);
    this.enablePolygonEditingAndDragging();

    this.form.latlng = this.selectedCity.latlng.map((point: any) => ({ lat: point.lat, lng: point.lng }));
  }

  enablePolygonEditingAndDragging(): void {
    this.polygons.forEach((polygon: any) => {
      polygon.setEditable(true);
      polygon.setDraggable(true);

      google.maps.event.addListener(polygon.getPath(), 'set_at', () => {
        this.updateFormLatLng(polygon);
      });

      google.maps.event.addListener(polygon.getPath(), 'insert_at', () => {
        this.updateFormLatLng(polygon);
      });
    });
  }
  updateFormLatLng(polygon: any): void {
    const paths = polygon.getPaths();
    const coordinates = paths.getAt(0).getArray();
    this.form.latlng = coordinates.map((latLng) => ({
      lat: latLng.lat(),
      lng: latLng.lng(),
    }));
  }


  onSubmit(cityForm: any) {
    if (this.form.latlng) {
      this.form.city = this.cityInput.nativeElement.value;
      const cityData = {
        countryid: this.form.countryid,
        city: this.form.city,
        latlng: this.form.latlng,
      };
      if (this.selectedCity._id) {
        this.cityService.editZone(this.selectedCity._id, cityData).subscribe(
          (response) => {
            console.log(response.message);
            this.clearPolygonsAndMarkers();
            this.clearDrawnPolygon();
            this.marker.setMap(null);
            this.isEdit = false;
            const indexToUpdate = this.cityList.findIndex(city => city._id === this.selectedCity._id);
            if (indexToUpdate !== -1) {
              this.cityList[indexToUpdate] = response.updatedCity;
            }
            this.displayPolygonsOnMap(this.cityList);
            this.form.city = '';
            this.selectedCity._id='';
            this.successMessage = response.message;
            this.clearMessageAfterTimeout();
          },
          (error) => {
            console.error('Error editing zone :', error);
          }
        );
      }
      else {
        
        this.cityService.addCity(cityData).subscribe(
          (response) => {
            this.marker.setMap(null);
            console.log("---" + response.message);
            const newCity = response.newCity;
            this.cityList.push(newCity);
            this.form.latlng = "";
            this.displayPolygonsOnMap(this.cityList)
            this.form.city = '';
            this.successMessage = response.message;
            this.clearMessageAfterTimeout();
            
          },
          (error) => {
            console.error('Error adding City :', error.error.message);
            this.errorMessage = error.error.message;
            if (error.error.message === "City alreadys exists in the database") {
              this.clearDrawnPolygon();
            }
            this.clearMessageAfterTimeout();
          }
        );
      }

    }

  }

  clearDrawnPolygon() {
    if (this.drawnPolygon) {
      this.clearPolygonListeners(this.drawnPolygon);
      this.drawnPolygon.setMap(null);
      this.drawnPolygon = null;
    }
  }
  clearMessageAfterTimeout(): void {
    setTimeout(() => {
      this.successMessage = null;
      this.errorMessage = null;
    }, 3000);
  }
  clearPolygonListeners(polygon: any): void {
    google.maps.event.clearInstanceListeners(polygon.getPath());
  }

}
