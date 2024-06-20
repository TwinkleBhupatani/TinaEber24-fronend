import { Component,ChangeDetectorRef, HostListener  } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VehiclePricingService } from '../../../services/vehicle-pricing.service';
import { SessionService } from 'src/app/services/session.service';
@Component({
  selector: 'app-vehicle-pricing',
  templateUrl: './vehicle-pricing.component.html',
  styleUrls: ['./vehicle-pricing.component.scss']
})
export class VehiclePricingComponent { 
  
  vehiclePriceForm: FormGroup;
  vehiclePriceList: any[] = [];
   countryList: string[] = [];
   cityList: any[] = [];
   existingTypes: string[]=[];
   newTypesList: string[]=[];
   totalTypesList: string[]=[];
  selectedCountry: any;
  selectedCity: any;
  selectedType: any;
  countries: any;
  typeListByCity: string[]=[];
  vehcileList: any[]=[];
  successMessage="";
  constructor(private fb: FormBuilder,private VehiclePricingService: VehiclePricingService,private cdr: ChangeDetectorRef,
    private SessionService: SessionService) {}
    
  @HostListener('window:keydown')
  onKeydown(): void {
    this.SessionService.resetSessionTimer();
  }

  @HostListener('window:mousemove')
  onUserActivity(): void {
    this.SessionService.resetSessionTimer();
  }
  ngOnInit() {
    this.initForm();
    this.loadVehiclePrices();
    this.loadCountries(); 
  }

  initForm() {
    this.vehiclePriceForm = this.fb.group({
      countryId: ['', Validators.required],
      country: ['', Validators.required],
      cityId: ['', Validators.required],
      city: ['', Validators.required],
      type: ['', Validators.required],
      typeId: ['', Validators.required],
      dProfit: ['', Validators.required],
      mFare: ['', Validators.required],
      distPrice: ['', Validators.required],
      basePrice: ['', Validators.required],
      ppUnitDist: ['', Validators.required],
      ppUnitTime: ['', Validators.required],
      maxSpace: ['', Validators.required],
    });
  }
  
  loadVehiclePrices()
  {
    this.VehiclePricingService.getVehiclePrices().subscribe(
    (response)=>{
      console.log(response);
      this.vehiclePriceList=response;
    },(error)=>{
      console.error('Error loading vehicle prices:', error);
    });
  }
  loadCountries()
  {
    this.VehiclePricingService.getCountryName().subscribe(
      (response)=>{
          this.countries=response;
          this.countryList=response.map((country)=>country.country);
      },(error)=>{
        console.error('Error getting country name:', error);
      })
  }
  onCountryChange()
  {
    this.selectedCountry=this.vehiclePriceForm.get('country').value;
    const country = this.countries.find((country: any) => country.country === this.selectedCountry);
    // console.log("country",country)
    if(country)
    {
      this.vehiclePriceForm.get('countryId').setValue(country._id);
    }
    this.vehiclePriceForm.get('type')?.setValue('');
    this.vehiclePriceForm.get('city')?.setValue('');
    this.loadCities();
  }

loadCities() {
  if (this.selectedCountry) {
    const selectedCountryId=this.vehiclePriceForm.value.countryId;
    if(selectedCountryId)
    { 
        this.VehiclePricingService.getAllCitiesByCountry(selectedCountryId).subscribe(
        (response)=>{
          this.cityList=response;
        },(error)=>{
          console.error('Error getting city name:', error);
        })
    }
    else{
      this.cityList = [];
    }
  } else {
    this.cityList = [];
  }
}

onCityChange()
{
  this.selectedCity=this.vehiclePriceForm.value.city;
  const city = this.cityList.find((city: any) => city.city === this.selectedCity);
 
    if(city)
    {
      this.vehiclePriceForm.get('cityId').setValue(city._id);
    }
    this.vehiclePriceForm.get('type')?.setValue('');
  this.loadTypes();
}

loadTypes() {
  if (this.selectedCity) {
    this.VehiclePricingService.getTypesByCity(this.selectedCity).subscribe(
      (response) => {
        this.typeListByCity=response;
        this.VehiclePricingService.getTypes().subscribe(
          (res) => {
            this.vehcileList=res;
            this.totalTypesList = res.map((type) => type.vtype);
            // console.log(this.totalTypesList);
            this.newTypesList = this.totalTypesList.filter(type => !this.typeListByCity.includes(type));
            // console.log(this.newTypesList);
          },
          (error) => {
            console.error('Error loading total types', error);
          }
        );
      },
      (error) => {
        console.error('Error getting vehicle type:', error);
      }
    );
  } else {
    this.typeListByCity = [];
  }
}

onTypeChange()
{
  this.selectedType=this.vehiclePriceForm.value.type;
  const type = this.vehcileList.find((type: any) => type.vtype === this.selectedType);
  if(type)
  {
    this.vehiclePriceForm.get('typeId').setValue(type._id);
  }
}

  addVehiclePrice() {
    if (this.vehiclePriceForm.valid) {
      const vehiclePriceData = this.vehiclePriceForm.value;
      this.VehiclePricingService.addVehiclePrice(vehiclePriceData).subscribe(
        (response) => {
          console.log(response.message);
          this.vehiclePriceList.push(vehiclePriceData);
          this.successMessage=response.message;
          this.clearMessageAfterTimeout(); 
          this.vehiclePriceForm.reset();
          this.vehiclePriceForm.get('type')?.setValue('');
          this.vehiclePriceForm.get('country')?.setValue('');
          this.vehiclePriceForm.get('city')?.setValue('');
          this.newTypesList=[''];
          this.cityList=[''];
        },
        (error) => {
          console.error('Error adding vehicle price:', error);
        }
      ); 
    }
}

clearMessageAfterTimeout(): void {
  setTimeout(() => {
    this.successMessage = null; 
  }, 3000); 
}
}
