import { Component, HostListener } from '@angular/core';
import { SessionService } from 'src/app/services/session.service';
import { ConfirmedRidesService } from 'src/app/services/confirmed-rides.service';

import { Modal } from 'bootstrap';
declare var google: any;
@Component({
  selector: 'app-ride-history',
  templateUrl: './ride-history.component.html',
  styleUrls: ['./ride-history.component.scss']
})
export class RideHistoryComponent {
  constructor(private SessionService: SessionService,private ConfirmedRidesService: ConfirmedRidesService,
    ){}
  @HostListener('window:keydown')
  onKeydown(): void {
    this.SessionService.resetSessionTimer();
  }

  @HostListener('window:mousemove')
  onUserActivity(): void {
    this.SessionService.resetSessionTimer();
  }
  completedAndCancelledRidesList: any[] = [];
  selectedRide:any;
  searchByStatus: any;
  searchBySource: string = '';
  searchByDestination: string = '';
  searchByDate: string = '';
  searchByType: any;
  searchByName: string = '';
  searchById: string = '';
  searchByNumber: string = '';
  searchByKey: string="";

  ngOnInit()
  {
    this.loadRides();
  }
  loadRides() { 
    const flag=false;
    // console.log('Search parameters:', this.searchByName, this.searchByNumber, this.searchById, this.searchByDate);
    this.ConfirmedRidesService.getCreatedRides(this.searchByType || '', this.searchByName || "", this.searchByNumber || "", this.searchById || '', this.searchByDate || '', this.searchByStatus || '', this.searchBySource || '', this.searchByDestination || '',this. searchByKey || '',flag).subscribe(
      (response) => {
        this.completedAndCancelledRidesList = response;
      }, (error) => {
        console.error("error fetching created rides", error)
      })
  }
  onRowClicked(ride: any) {
    // console.log(ride);
    this.selectedRide = ride;
    const myModal = new Modal(document.getElementById('action_modal')!);
    myModal.show();
    
    if (ride.stopsInputs && ride.stopsInputs.length > 0) {
      // Filter out empty strings from stopsInputs array
      const stops = ride.stopsInputs.filter(stop => stop.trim() !== '');
  
      setTimeout(() => {
        const addresses = [ride.source, ...stops, ride.destination];
        this.geocodeAddresses(addresses);
      }, 1000);
    } else {
      // If stopsInputs array is empty, draw route directly from source to destination
      setTimeout(() => {
        const addresses = [ride.source, ride.destination];
        this.geocodeAddresses(addresses);
      }, 1000);
    }
  }

  // geocodeAddresses(addresses: string[]) {
  //   const geocoder = new google.maps.Geocoder();
  //   const geocodedLocations: any[] = [];

  //   addresses.forEach((address, index) => {
  //     geocoder.geocode({ address: address }, (results: any[], status: any) => {
  //       if (status == google.maps.GeocoderStatus.OK) {
  //         const location = results[0].geometry.location;
  //         geocodedLocations[index] = location;
  //         // console.log("iiiiii",geocodedLocations);
  //         if (geocodedLocations.length === addresses.length) {
  //           this.drawRoute(geocodedLocations[0], geocodedLocations.slice(1, -1), geocodedLocations[addresses.length - 1]);
  //         }
  //       } else {
  //         console.error("Geocode was not successful for the following reason:", status);
  //       }
  //     });
  //   });
  // }




  // drawRoute(source: string, stops: string[], destination: string) {
  //   const directionsService = new google.maps.DirectionsService();
  //   const directionsRenderer = new google.maps.DirectionsRenderer();
    
  //   const map = new google.maps.Map(document.getElementById('map'), {
  //     center: { lat: 0, lng: 0 },
  //     zoom: 7,
  //   });
    
  //   directionsRenderer.setMap(map);

  //   const waypoints = stops.map(stop => ({ location: stop, stopover: true }));

  //   const request = {
  //     origin: source,
  //     destination: destination,
  //     waypoints: waypoints,
  //     travelMode: google.maps.TravelMode.DRIVING
  //   };

  //   directionsService.route(request, function(result: any, status: any) {
  //     if (status == google.maps.DirectionsStatus.OK) {
  //       directionsRenderer.setDirections(result);
  //     } else {
  //       console.error("Error fetching directions:", status);
  //     }
  //   });
  // }

  geocodeAddresses(addresses: any) {
    const geocoder = new google.maps.Geocoder();
    const geocodedLocations = [];
  
    addresses.forEach((address, index) => {
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          const location = results[0].geometry.location;
          geocodedLocations[index] = location;
  
          if (geocodedLocations.length === addresses.length) {
            this.drawPolyline(geocodedLocations);
          }
        } else {
          console.error("Geocode was not successful for the following reason:", status);
        }
      });
    });
  }
  
  drawPolyline(locations: any) {
    const map = new google.maps.Map(document.getElementById('map'), {
      center: locations[0],
      zoom: 6,
    });
  
    const polyline = new google.maps.Polyline({
      path: locations,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });
  
    polyline.setMap(map);
  }
  

  
  onSearch(
    searchByStatus: HTMLInputElement | string, 
    searchByDate: HTMLInputElement | string, 
    searchBySource: HTMLInputElement | string, 
    searchByDestination: HTMLInputElement | string
  )  {
    const status = typeof this.searchByStatus === 'string' ? searchByStatus : (searchByStatus as HTMLInputElement)?.value;
    this.searchByStatus = status;
    const date = typeof searchByDate === 'string' ? searchByDate : (searchByDate as HTMLInputElement)?.value;
    this.searchByDate = date;
    const source = typeof searchBySource === 'string' ? searchBySource : (searchBySource as HTMLInputElement)?.value;
    this.searchBySource = source;
    const destination = typeof searchByDestination === 'string' ? searchByDestination : (searchByDestination as HTMLInputElement)?.value;
    this.searchByDestination = destination;
    this.loadRides();
  }
  handleStatus(event: Event) {
    const status = (event.target as HTMLSelectElement).value;
    this.searchByStatus=status;
  }

  searchByKeyword(search: any)
  {
    this.searchByKey=search;
    this.loadRides();
  }

  resetForm(form: any) {

    form.resetForm();
    this.searchByStatus = '';
    this.searchBySource = '';
    this.searchByDestination = '';
    this.searchByDate = '';
    this.searchByKey="",
    this.loadRides();
  }

  exportToCSV() {
  const csvHeader = [
    'RequestId',
    'UserName',
    'UserNumber',
    'PickUpTime',
    'PickUpAddress',
    'DropOffAddress',
    'Type',
    'Status',
    'Driver Name'
  ];

  const csvData = this.completedAndCancelledRidesList.map(ride => [
    ride._id,
    ride.uname,
    ride.unumber,
    ride.rideDateTime,
    ride.source,
    ride.destination,
    ride.vtype,
    ride.status,
    ride.dname
  ]);
  const csvRows = csvData.map(row => row.join(','));
  const csvContent = [csvHeader.join(','), ...csvRows].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ride-history.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

}
