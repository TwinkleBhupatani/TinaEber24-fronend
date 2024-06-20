import { Component, HostListener, OnDestroy } from '@angular/core';
import { SessionService } from '../../../services/session.service';
import { SocketService } from 'src/app/services/socket.service';
import { RunningRequestservice } from 'src/app/services/running-request.service';
import { ConfirmedRidesService } from 'src/app/services/confirmed-rides.service';
import { ChangeDetectorRef } from '@angular/core';
import { DriverAssignmentService } from 'src/app/services/driver.service';
import { coerceStringArray } from '@angular/cdk/coercion';

@Component({
  selector: 'app-running-request',
  templateUrl: './running-request.component.html',
  styleUrls: ['./running-request.component.scss']
})
export class RunningRequestComponent {
  cronMessage: string;
  selectedDriver: any;
  selectedDriversList: any[] = [];
  createdRidesList: any[] = [];
  seconds: any;
  timers: any = {};

  constructor(private SessionService: SessionService, private socketService: SocketService, private changeDetectorRef: ChangeDetectorRef,
    private RunningRequestservice: RunningRequestservice, private ConfirmedRidesService: ConfirmedRidesService, private DriverAssignmentService: DriverAssignmentService) {

  }
  @HostListener('window:keydown')
  onKeydown(): void {
    this.SessionService.resetSessionTimer();
  }

  @HostListener('window:mousemove')
  onUserActivity(): void {
    this.SessionService.resetSessionTimer();
  }


  ngOnInit() {
    this.socketService.createSocket();
    this.RunningRequestservice.getSeconds().subscribe(
      (response)=>{
        this.seconds=response;
      },(error)=>{
        console.error("EErrr feftching assigned driver", error)
      })
    this.socketService.listenToEvent('cronMessage').subscribe((selectedDriver: any) => {
      this.listenToCronComplete(selectedDriver);
    });

    this.socketService.listenToEvent('rideUpdated').subscribe((response: any) => {
      this.listenToRideUpdated(response);  
     });

    this.socketService.listenToEvent('assignDriver').subscribe((data: any) => {
      
      this.loadRides(data);
    });

    this.RunningRequestservice.getAssignedDrivers().subscribe(
      (response) => {
        this.selectedDriversList = response;
      }, (error) => {
        console.error("EErrr feftching assigned driver", error);
      });

      this.socketService.listenToEvent('assignDriverRequestRejected').subscribe((selectedDriver: any) => {
        this.selectedDriversList = this.selectedDriversList.filter(d => !(d.driverid === selectedDriver.driver.driverid && d._id === selectedDriver.driver._id));
      });

      this.socketService.listenToEvent('assignDriverRequestAccepted').subscribe((selectedDriver: any) => {
        this.selectedDriversList = this.selectedDriversList.filter(d => !(d.driverid === selectedDriver.driverid && d._id === selectedDriver._id));
      });

  }

  loadRides(data: any) {
    console.log(data)
    const flag=true;
    this.ConfirmedRidesService.getCreatedRides('', "", "", '', '',"","","","",flag).subscribe(
      (response) => {
        this.createdRidesList = response;
        const foundRide = this.createdRidesList.find((ride: any) => ride.driverid === data._id);
        this.selectedDriver = foundRide;
        // console.log("seleectd driver",this.selectedDriver);
        this.selectedDriversList.push(this.selectedDriver);
  
      }, (error) => {
        console.error("error fetching created rides", error)
      })
  }
  listenToCronComplete(driver: any) {
    const foundRide = this.selectedDriversList.find(d => d.driverid === driver._id);
    if (foundRide ) {
      if(foundRide.assignAnyAvailable)
        {
          var d=driver;
          d={ ...d, nearest: true };
          this.socketService.emitEvent('assignDriverNotAcceptedRejecetd', d);
          // this.nearest=true;
          // this.socketService.emitEvent('holdCompleted', driver);
        }
        else
        {
          foundRide.status = 'Reassign';
          foundRide.driverId = "";
        
            foundRide.assignedDrivers = [{
              driverid: "",
              assignedTime: "",
            }];
            // this.nearest=false;
            this.ConfirmedRidesService.updateRide(foundRide._id, foundRide.status, foundRide.driverId,foundRide.assignedDrivers,foundRide.assignAnyAvailable)
            .subscribe(response => {
              var data=response.data
              data={ ...data, nearest: false };
              this.socketService.emitEvent('assignDriverNotAcceptedRejecetd', data);
            });
        }
      
    
    }

    const indexToRemove = this.selectedDriversList.findIndex(d => d.driverid === driver._id);
    if (indexToRemove !== -1) {
      this.selectedDriversList.splice(indexToRemove, 1);
    }

  }
listenToRideUpdated(response: any){

}
 
  rejectDriver(driver: any) {

    if (driver) {

      const foundRide = this.selectedDriversList.find(d => d.driverid === driver.driverid);
      if (foundRide) {
        foundRide.status = 'Rejected';
            foundRide.assignedDrivers = [{
              driverid: "",
              assignedTime: "", 
          }];
        
        this.ConfirmedRidesService.updateRide(foundRide._id, foundRide.status, foundRide.driverid,foundRide.assignedDrivers,foundRide.assignAnyAvailable)
          .subscribe(response => {
            this.selectedDriversList = this.selectedDriversList.filter(d => !(d.driverid === driver.driverid && d._id === driver._id));
            this.socketService.emitEvent('assignDriverRequestRejected', { driver });
            
          });
      }
    }
  }

  requestAccepted(driver: any) {

    if (driver) {
      const foundRide = this.selectedDriversList.find(d => d.driverid === driver.driverid);
      if (foundRide) {
        foundRide.status = 'Accepted';
        foundRide.driverid = driver.driverid;
        foundRide.assignedDrivers = [{
          driverid: "",
          assignedTime: "", 
      }];
        this.ConfirmedRidesService.updateRide(foundRide._id, foundRide.status, foundRide.driverid,  foundRide.assignedDrivers,foundRide.assignAnyAvailable)
          .subscribe(response => {
            this.selectedDriversList = this.selectedDriversList.filter(d => !(d.driverid === driver.driverid && d._id === driver._id));
            this.socketService.emitEvent('assignDriverRequestAccepted', driver);
          });
      }

    }
  }
}
