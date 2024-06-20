import { Component , HostListener } from '@angular/core';
import { CountryService } from '../../../services/country.service';
import {SessionService} from '../../../services/session.service'

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
})
export class CountryComponent {
  form={
    selectedCountry: '',
    currency:'',
    flagUrl: '',
    country_code:'',
    country_calling_code:'',
  time_zone:  '',
  population: '',
  lat:'',
  lng: '',
  }
 
  countryList: any[] = [];
  countries: string[] = [];
  details: any='';
  searchdetails: any='';
  searchMessage : string | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private countryService: CountryService, private SessionService: SessionService) {}
  @HostListener('window:keydown')
  onKeydown(): void {
    this.SessionService.resetSessionTimer();
  }

  @HostListener('window:mousemove')
  onUserActivity(): void {
    this.SessionService.resetSessionTimer();
  }

  ngOnInit() {
    this.countryService.getCountries().subscribe(
      (response) => {
       this.details=response;
      //  console.log(response)
        this.countries = response.map((country) => country.name.common);
      },
      (error) => {
        console.error('Error fetching countries:', error);
      }
    );
    this.loadAllCountries();
  }

  loadAllCountries() {
    this.countryService.getAllCountries().subscribe(
      (response) => {
        this.countryList = response;
        // console.log(this.countryList);
      },
      (error) => {
        console.error('Error loading country list:', error);
      }
    );
  }

  onCountryChange() {
    if (this.form.selectedCountry && this.details) {
      const selectedCountryDetails = this.details.find(
        (country) => country.name.common === this.form.selectedCountry
      );
  
      if (selectedCountryDetails) {
        const currencyArray = Object.values(selectedCountryDetails.currencies);
        if (currencyArray.length > 0 && typeof currencyArray[0] === 'object') {
        
          this.form.currency = (currencyArray[0] as { name: string }).name || '';

        }
       this.form.lat=selectedCountryDetails.latlng[0];
       this.form.lng=selectedCountryDetails.latlng[1];
        this.form.flagUrl = selectedCountryDetails.flags?.png || ''; 
        this.form.country_code = selectedCountryDetails.cca2;
        this.form.country_calling_code=selectedCountryDetails.idd.root + selectedCountryDetails.idd.suffixes[0];
        this.form.time_zone = selectedCountryDetails.timezones[0];
        this.form.population = selectedCountryDetails.population;
      }
    }
  }
  
 onSubmit(form: any) {
  const formData = new FormData();
  formData.append('country', this.form.selectedCountry);
  formData.append('currency', this.form.currency);
  formData.append('flagImage', this.form.flagUrl);
  formData.append('countryCode', this.form.country_code);
  formData.append('countryCallingCode', this.form.country_calling_code);
  formData.append('timeZone', this.form.time_zone);
  formData.append('population', this.form.population);
  formData.append('lat',this.form.lat);
  formData.append('lng',this.form.lng);
  this.countryService.addCountry(formData).subscribe(
    (response) => {
        console.log(response.message);
        this.successMessage=response.message; 
        this.clearMessageAfterTimeout();
         this.loadAllCountries();
         this.form.flagUrl = ''
         form.resetForm(); 
         this.form.selectedCountry="";
    },
    (error) => {
        console.error('Error adding Country :', error.error.message);
        this.errorMessage=error.error.message;
        this.clearMessageAfterTimeout();
    }
);
    // console.log('Selected Country:', this.form.selectedCountry);
 }


onSearch(searchText: HTMLInputElement)
{
  // console.log(searchText.value)
  this.countryService.searchCountry(searchText.value).subscribe(
    (response) => {
         this.searchdetails=response;
        //  console.log(this.searchdetails)
         if (!this.searchdetails || this.searchdetails.length === 0) {
          this.searchMessage = "Country Not Found";
          this.clearMessageAfterTimeout();
        } else {
          this.searchMessage = null;
        }
        searchText.value='';
    },
    (error) => {
        console.error('Error seraching Country :', error);
    }
);
}

clearMessageAfterTimeout(): void {
  setTimeout(() => {
    this.successMessage = null; 
    this.errorMessage = null; 
    this.searchMessage=null;
  }, 3000); 
}

}
