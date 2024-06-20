import { Component, HostListener, ViewChild, ElementRef,NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { SessionService } from 'src/app/services/session.service';
import { CreateRideService } from '../../../services/create-ride.service';
import { Modal } from 'bootstrap';

declare var google: any;

@Component({
  selector: 'app-create-ride',
  templateUrl: './create-ride.component.html',
  styleUrls: ['./create-ride.component.scss']
})
export class CreateRideComponent {
  @ViewChild('selectedCountryCode') selectedCountryCode: ElementRef;

  constructor(
    private fb: FormBuilder,
    private SessionService: SessionService,
    private CreateRideService: CreateRideService,
    private ngZone: NgZone
  ) { }

  @HostListener('window:keydown')
  onKeydown(): void {
    this.SessionService.resetSessionTimer();
  }

  @HostListener('window:mousemove')
  onUserActivity(): void {
    this.SessionService.resetSessionTimer();
  }

  createRideForm: FormGroup;
  countryCodes: string[] = [];
  userDetails: any;
  message: any;
  errorMessage: any;
  checkCard: boolean= true;
  stops: any;
  isSource: boolean= false;
  isDestination: boolean= false;
  add = false;
  map: any;
  markers: any[] = [];
  sourceMarkers: any[] = [];
  destinationMarkers: any[] = []; 
  stopMarkers: any[] = [];
  types: any[]=[];
  sourceLatLng: any;
  destinationLatLng: any;
  directionsService: any;
  directionsRenderer: any;
  estimateTime: any;
  estimateDistance: any;
  estimateTimeFormat: any;
  estimateDistanceFormat: any;
  isSet: boolean = false;
  selectedType: any = null;
  options = {
    componentRestrictions: {
      country: 'IN'
    }
  };
  ngOnInit() {
    this.countryCallingCode();
    this.initForm();
  }

  displayMap() {
    setTimeout(() => {
      this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
        center: {
          lat: 23.675,
          lng: -100.877,
        },
        zoom: 4,
      });
      this.directionsService = new google.maps.DirectionsService();
      this.directionsRenderer = new google.maps.DirectionsRenderer({ map: this.map });
    }, 100);
  }
  

  initForm() {
    this.createRideForm = this.fb.group({
      unumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/), Validators.minLength(10), Validators.maxLength(10)]],
      uname: [{ value: '', disabled: true }],
      uemail: [{ value: '', disabled: true }],
      userid:[''],
      option: [{ value: 'cash', disabled: true }],
      source: [{ value: '', disabled: true }],
      destination: [{ value: '', disabled: true }],
      stopsInputs: this.fb.array([]),
      typeid: [''],
      estimateDistance: [''],
      estimateTime: [''],
      estimateFee: [''],
      bookingOption:['now'],
      rideDateTime: [''] 
    });
    this.onBookingOptionChange()
  }
  countryCallingCode() {
    this.CreateRideService.getCCCode().subscribe(
      (response) => {
        this.countryCodes = response.map((code) => code.countryCallingCode);
      },
      (error) => {
        console.error('Error loading country code:', error);
      }
    );
  }
   initSource() {
   
    const source = document.getElementById('autocomplete-source') as HTMLInputElement;

    const autocomplete = new google.maps.places.Autocomplete(source, this.options);
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      this.createRideForm.patchValue({ source: place.formatted_address });
     
      if (place.geometry) {
        const latitudeString = place.geometry.location.lat();
        const longitudeString = place.geometry.location.lng();
        const latitude = Number(latitudeString);
        const longitude = Number(longitudeString);
        this.CreateRideService.checkCity(latitude, longitude).subscribe(
          (response)=>{
            this.types=response.types;
            
            if(response.message==='Yes')
            {
              this.createRideForm.get('destination')?.setValidators([Validators.required]);
              this.createRideForm.get('destination')?.enable();
              this.initDestination();
              this.sourceLatLng=place.geometry.location.toJSON();
              this.updateMap(this.sourceLatLng.lat,this.sourceLatLng.lng);
              this.addSourceMarker(this.sourceLatLng.lat,this.sourceLatLng.lng);
              this.calculateDistance();
              console.log("ues")
            }
            else
            {
             console.log("no")
              this.createRideForm.get('source').setValue("");
              this.createRideForm.get('destination')?.disable();
              this.errorMessage=`Vehicle Pricing is not setted for ${place.formatted_address}. Select Another Pick-Up Location.`
              this.removeSourceMarkers();
              this.clearMessage();
            }
          },(error)=>{
            console.error("Error getting city",error);
          });
       
      }
    });
  }

  initDestination() {   
    const destination = document.getElementById('autocomplete-destination') as HTMLInputElement;
    const autocomplete = new google.maps.places.Autocomplete(destination, this.options);
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      this.createRideForm.patchValue({ destination: place.formatted_address });
      if(place.geometry)
      {
        this.destinationLatLng=place.geometry.location.toJSON();
        this.updateMap(this.destinationLatLng.lat,this.destinationLatLng.lng);
        this.addDestinationMarker(this.destinationLatLng.lat,this.destinationLatLng.lng);
        this.calculateDistance();
      }
    });
  }

  initStopAutocomplete() {
    this.stopsInputs.controls.forEach((control: FormControl, index: number) => {
      const stopInputElement = document.getElementById(`autocomplete-stop-${index}`) as HTMLInputElement;

      if (stopInputElement) {
        const autocomplete = new google.maps.places.Autocomplete(stopInputElement, this.options);

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          control.setValue(place.formatted_address);
          if (place.geometry) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();

            this.updateMap(lat, lng);
            this.addOrUpdateStopMarker(lat, lng, index);
            this.calculateDistance();
          }
        });
      }
    });
  }
  updateMap(lat: number, lng: number) {
    this.map.setCenter({
      lat: lat,
      lng: lng
    });
    this.map.setZoom(8);
  }

  addSourceMarker(lat: number, lng: number) {
    this.removeSourceMarkers();
    if (this.map) {
      const marker = new google.maps.Marker({
        position: {
          lat: lat,
          lng: lng,
        },
        map: this.map
      });
      this.sourceMarkers.push(marker);
    }
  }

  addDestinationMarker(lat: number, lng: number) {
    this.removeDestinationMarkers();
    if (this.map) {
      const marker = new google.maps.Marker({
        position: {
          lat: lat,
          lng: lng,
        },
        map: this.map
      });
      this.destinationMarkers.push(marker);
    }
  }

  addOrUpdateStopMarker(lat: number, lng: number, index: number) {
    if (index < this.stopMarkers.length) {
      const marker = this.stopMarkers[index];
      marker.setPosition({ lat, lng });
    } else {
      if (this.map) {
        const marker = new google.maps.Marker({
          position: { lat, lng },
          map: this.map,
          stopIndex: index,
        });
        this.stopMarkers.push(marker);
      }
    }
  }


  calculateDistance() {
    if (this.sourceLatLng && this.destinationLatLng) {
      this.selectedType="";
      this.createRideForm.get('typeid').setValue("");
      this.createRideForm.get('estimateDistance').setValue("");
      this.createRideForm.get('estimateTime').setValue("");
      this.createRideForm.get('estimateFee').setValue("");
      const stops = this.stopsInputs.value.filter((stop: string) => stop.trim() !== '');
      
      const waypoints = stops.map((stop: string) => ({
        location: stop,
        stopover: true
      }));
  
      const request = {
        origin: new google.maps.LatLng(this.sourceLatLng.lat, this.sourceLatLng.lng),
        destination: new google.maps.LatLng(this.destinationLatLng.lat, this.destinationLatLng.lng),
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING
      };
  
      this.directionsService.route(request, (response: any, status: any) => {
        if (status === 'OK') {
          this.directionsRenderer.setDirections(response);
  
          
          const legs = response.routes[0].legs;
          let totalDistance = 0;
          let totalTime = 0;
  
          legs.forEach((leg: any) => {
            totalDistance += leg.distance.value;
            totalTime += leg.duration.value;
          });
  
          this.estimateDistanceFormat = (totalDistance / 1000).toFixed(2) + ' km';
          this.estimateTimeFormat = this.formatTime(totalTime);
          const hours = Math.floor(totalTime / 3600)*60;
          const minutes = Math.floor((totalTime % 3600) / 60);
          this.estimateDistance=(totalDistance / 1000).toFixed(2);
          this.estimateTime=hours+minutes;
          console.log(this.types)
          this.types = this.types.map(type => {
            
            const basePrice = type.basePrice;
            const timePrice = (this.estimateTime * type.ppUnitTime);
            let distancePrice = 0;
            
            if (this.estimateDistance > type.distPrice) {
              distancePrice = ((this.estimateDistance - type.distPrice) * type.ppUnitDist);
            }
      
            const fee = (basePrice + distancePrice + timePrice).toFixed(2);
            return {
              ...type,
              calculatedBasePrice: (basePrice).toFixed(2),
              calculatedDistancePrice:( distancePrice.toFixed(2)),
              calculatedTimePrice: (timePrice).toFixed(2),
              calculatedFee: fee
            };
          });
        } else {
          console.error('Error calculating route: ' + status);
        }
      });
    }
  }
  
  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours} hours ${minutes} minutes` : `${minutes} minutes`;
  }
  

  check() {
    const number = this.selectedCountryCode.nativeElement.value + this.createRideForm.value.unumber;
    this.CreateRideService.getUserDetailsByNumber(number).subscribe(
      (response) => {
        this.userDetails = response.user;
       
        this.message = response.message;
        this.clearMessage();
        
        if (this.userDetails) {
          if(this.userDetails.cards.length>0)
          {
           this.checkCard=true;
          }
          else{
           this.checkCard=false;
          }
          this.createRideForm.get('userid').setValue(this.userDetails._id);
          this.createRideForm.get('option')?.setValidators([Validators.required]);
          this.createRideForm.get('bookingOption')?.setValidators([Validators.required]);
          this.createRideForm.get('option')?.enable();
          this.createRideForm.get('source')?.setValidators([Validators.required]);
          this.createRideForm.get('source')?.enable();
          this.createRideForm.get('uemail').setValue(this.userDetails.uemail);
          this.createRideForm.get('uname').setValue(this.userDetails.uname);
          this.createRideForm.get('option').setValue(this.createRideForm.get('option').value);
          this.createRideForm.get('bookingOption').setValue(this.createRideForm.get('bookingOption').value);
          this.createRideForm.get('unumber')?.disable();
        
        }
      },
      (error) => {
        console.error('Error fetching user data', error);
      }
    );
  }

  onCountryCodeChange() { }

  get stopsInputs(): FormArray {
    return this.createRideForm.get('stopsInputs') as FormArray;

  }

  setTsops(numberOfstops: number): void {
    while (this.stopsInputs.length !== 0) {
      this.stopsInputs.removeAt(0);
    }

    for (let i = 0; i < numberOfstops; i++) {
      this.stopsInputs.push(this.fb.control(''));
    }
  }
  showStops() {
    if (this.areSourceAndDestinationSet()) {
      this.CreateRideService.getStops().subscribe(
        (stops) => {
          this.stops = stops;
          this.setTsops(this.stops);
          this.add = true;
          setTimeout(() => {
            this.initStopAutocomplete();
          }, 100);
        },
        (error) => {
          console.error('Error fetching stops', error);
        }
      );
    }
  }
  

  nextSource()
  {
    this.isSource=true;
  
      this.displayMap();
      setTimeout(()=>this.initSource(),1000);

  }
  previousSource()
  {
   this.isSource=false;
  }
 
  book() {
    this.ngZone.run(() => {
      // 
      // Log validity and errors for each form control
  Object.keys(this.createRideForm.controls).forEach(controlName => {
    const control = this.createRideForm.get(controlName);
    // console.log(`Control ${controlName} - Validity: ${control.valid}, Errors: ${JSON.stringify(control.errors)}`);
  });
      if (this.createRideForm.get('bookingOption').value === 'now') {
        const currentDate = new Date();
        const formattedDate = this.formatDate(currentDate);
        this.createRideForm.get('rideDateTime').setValue(formattedDate); 
       
      }
      this.CreateRideService.createRide(this.createRideForm.value).subscribe(
        (response)=>{
          
           this.createRideForm.get('rideDateTime').clearValidators();
   
          this.message=response.message;
          this.clearMessage();
          this.userDetails="";
          this.isSource=false;
          this.createRideForm.reset();
          this.initForm();
          this.removeMapAndMarkers(); 
        },(error)=>{
          console.error("Error creating ride", error)
        });
   
    });
   
  }
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = this.padTo2Digits(date.getMonth() + 1);
    const day = this.padTo2Digits(date.getDate());
    const hours = this.padTo2Digits(date.getHours());
    const minutes = this.padTo2Digits(date.getMinutes());
  
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  
  // Helper function to pad numbers to 2 digits
  private padTo2Digits(num: number): string {
    return num.toString().padStart(2, '0');
  }
  removeSourceMarkers() {
    if (this.sourceMarkers.length > 0) {
      this.sourceMarkers.forEach(marker => marker.setMap(null));
      this.sourceMarkers = [];
    }
  }

  removeDestinationMarkers() {
    if (this.destinationMarkers.length > 0) {
      this.destinationMarkers.forEach(marker => marker.setMap(null));
      this.destinationMarkers = [];
    }
  }

  removeStop(index: number): void {
    const stopControl = this.stopsInputs.at(index) as FormControl;
    stopControl.setValue('');
    this.removeStopMarker(index);
  }
  
  removeStopMarker(index: number): void {
    const markerToRemove = this.stopMarkers.find(marker => marker['stopIndex'] === index);
    
    if (markerToRemove) {
      markerToRemove.setMap(null);
      this.stopMarkers = this.stopMarkers.filter(marker => marker !== markerToRemove);
      this.calculateDistance();
      this.initStopAutocomplete(); 
    }
  }
  

  
  removeMapAndMarkers() {
    this.map = null;
    this.removeDestinationMarkers();
    this.removeSourceMarkers();
    this.directionsService = null;
    this.directionsRenderer = null;
    this.sourceLatLng = null;
    this.destinationLatLng = null;
    this.estimateTime = null;
    this.estimateDistance = null;
    this.estimateTimeFormat = null;
    this.estimateDistanceFormat = null;
    this.isSet = false;
  }

  isSourceSet(): boolean {
    const source = this.createRideForm.get('source')?.value;
    return !!source;
  }

areSourceAndDestinationSet(): boolean {
  const source = this.createRideForm.get('source')?.value;
  const destination = this.createRideForm.get('destination')?.value;
  this.isSet=true;
  this.createRideForm.get('estimateDistance')?.setValidators([Validators.required]);
  this.createRideForm.get('estimateTime')?.setValidators([Validators.required]);
  this.createRideForm.get('estimateFee')?.setValidators([Validators.required]);
  this.createRideForm.get('typeid')?.setValidators([Validators.required]);
  return source !== '' && destination !== '';
}
  
addType()
{
  const myModal = new Modal(document.getElementById('action_modal')!);
  myModal.show();
}

onRowClicked(type: any) {
    this.selectedType = type.type;
    if(this.selectedType === type.type)
    {     
      // console.log(this.selectedType);
      // console.log(type.typeId);
      // console.log(type.calculatedFee);
      this.createRideForm.get('typeid').setValue(type.typeId);
      this.createRideForm.get('estimateDistance').setValue(type.calculatedDistancePrice);
      this.createRideForm.get('estimateTime').setValue(type.calculatedTimePrice);
      this.createRideForm.get('estimateFee').setValue(type.calculatedFee);
    }
}


  onBookingOptionChange(): void {
    this.createRideForm.get('bookingOption').valueChanges.subscribe(value => {
      if (value === 'schedule') {
        this.createRideForm.get('rideDateTime').setValidators([Validators.required, this.futureDateValidator()])
        this.createRideForm.get('rideDateTime').updateValueAndValidity();  
      } 
    });
  }
  futureDateValidator() {
    return (control: any) => {
    
      const selectedDate = new Date(control.value);
      const currentDate = new Date();

      if (selectedDate < currentDate) {
 
        this.errorMessage="Selected date must be in the future.";
        this.clearMessage();
        return { pastDate: true };
      }

      return null;
    };
  }
  clearMessage() {
    setTimeout(() => {
      this.message = '';
      this.errorMessage='';
    }, 3000);
  }
}
