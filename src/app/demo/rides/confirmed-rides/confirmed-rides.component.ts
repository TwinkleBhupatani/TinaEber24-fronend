import { Component, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { SessionService } from '../../../services/session.service'
import { ConfirmedRidesService } from 'src/app/services/confirmed-rides.service';
import { SocketService } from 'src/app/services/socket.service';
import { SendEmailService } from 'src/app/services/send-email.service';
import { Modal } from 'bootstrap';
import { ChangeDetectorRef } from '@angular/core';
import { RunningRequestservice } from 'src/app/services/running-request.service';
import { SendSmsService } from 'src/app/services/send-sms.service';
import { PushNotificationService } from 'src/app/services/push-notification-service';
import { CounterService } from 'src/app/services/counter.service';
declare var google;
@Component({
  selector: 'app-confirmed-rides',
  templateUrl: './confirmed-rides.component.html',
  styleUrls: ['./confirmed-rides.component.scss']
})

export class ConfirmedRidesComponent {
  cronMessage: string;

  constructor(private SessionService: SessionService, private cdr: ChangeDetectorRef, private RunningRequestservice: RunningRequestservice,
    private ConfirmedRidesService: ConfirmedRidesService, private socketService: SocketService, private SendEmailService: SendEmailService,
    private SendSmsService: SendSmsService, private PushNotificationService: PushNotificationService, private CounterService: CounterService) {
    this.socketService.createSocket();

  }


  counter: number = 0;
  @HostListener('window:keydown')
  onKeydown(): void {
    this.SessionService.resetSessionTimer();
  }

  @HostListener('window:mousemove')
  onUserActivity(): void {
    this.SessionService.resetSessionTimer();
  }
  private cronMessageSubscription: Subscription | undefined;
  createdRidesList: any[] = [];
  availableDriversList: any[] = [];
  selectedDriversList: any[] = [];
  message: any;
  selectedRide: any;
  selectedDriver: any = null;
  searchByType: any;
  searchByName: string = '';
  searchById: string = '';
  searchByNumber: string = '';
  searchByDate: string = '';
  searchByStatus: any;
  searchBySource: string = '';
  searchByDestination: string = '';
  searchByKey: string = "";
  rejectedDriversList: any[] = [];
  requestAcceptedDrivers: any[] = [];
  selectedRideId: any;
  sendingDrivers: any[] = [];
  status: String;
  notAcceptedRejecetedMessage: String;
  acceptedMessage: String;
  rejectedMessage: String;
  same: string;
  assignanyAvailableDriver: boolean = true;
  allAvailableDrivers: any[] = [];
  availableDriversForRide: any[] = [];
  dname: any;
  assignmentQueue = [];
  driver: any[] = [];
  nearest:boolean=false;
  counters: number=0;
  ngOnInit() {
    // this.counter = this.CounterService.getCounter();
    this.PushNotificationService.requestPermission();

    this.socketService.listenToEvent('cronMessage').subscribe((selectedDriver: any) => {
      console.log("Crone completed");
      this.listenToCronComplete(selectedDriver);
    });

    this.socketService.listenToEvent('rideUpdated').subscribe((response: any) => {
     this.listenToRideUpdated(response);  
    });

    this.socketService.listenToEvent('hold').subscribe((response: any) => {
     
      this.clearMessage();
      this.listenToHold(response)
     });

     this.socketService.listenToEvent('reassignAll').subscribe((response: any) => {

      this.listenToReassignAll(response)
     });

    this.socketService.listenToEvent('allAssignanydriverCompleted').subscribe((response: any) => {
      this.listenToallAssignanydriverCompleted(response);  
     });

    this.socketService.listenToEvent('assignDriverRequestAccepted').subscribe((selectedDriver: any) => {

      const index = this.createdRidesList.findIndex((id) => id._id === selectedDriver._id);
      this.acceptedMessage = "Driver Approved Ride";

      this.clearMessage();
      if (index !== -1) {
        this.counters--;
        //   this.CounterService.decrementCounter();
        // this.counter = this.CounterService.getCounter();
        // console.log("sss", this.counter)
        const unumber = this.createdRidesList[index].unumber;
        const formData = new FormData;
        formData.append("to", unumber);
        formData.append("body", "Driver Accepted Request")
        this.SendSms(formData);
        this.createdRidesList[index].status = selectedDriver.status;
        this.createdRidesList[index].driverid = selectedDriver.driverid;
        this.requestAcceptedDrivers.push(selectedDriver);
      } else {
        console.log("Ride not found in createdRidesList");
      }
    });

    this.socketService.listenToEvent('assignDriverNotAcceptedRejecetd').subscribe((selectedRide: any) => {
      
      if(selectedRide && selectedRide.nearest)
        {
          this.sendingDrivers = this.sendingDrivers.filter((driver) => driver.requestId !== selectedRide.ride._id);
        }
      else
        {
          this.notAcceptedRejecetedMessage = "Sorry, No Driver is Available";
          this.clearMessage();
    
          const index = this.createdRidesList.findIndex((id) => id._id === selectedRide._id);
          const dname = this.createdRidesList[index].dname
          if (index !== -1) {
            if (dname) {
              this.PushNotificationService.sendDriverNotFoundNotification(this.createdRidesList[index].dname);
              // this.CounterService.incrementCounter();
    
              //   this.counter =  this.CounterService.getCounter();
              this.counters++;
              // console.log("sss", this.counter)
            }
           
            this.sendingDrivers = this.sendingDrivers.filter((driver) => driver.requestId !== selectedRide._id);
            this.createdRidesList[index].status = selectedRide.status;
            this.createdRidesList[index].driverId = "";
            this.createdRidesList[index].driverid = "";
            this.createdRidesList[index].dname = "";
          } else {
            console.log("Ride not found in createdRidesList");
          }
        }
    
    });

    this.socketService.listenToEvent('assignDriverRequestRejected').subscribe((selectedDriver: any) => {
      this.loadRides();
      this.rejectedMessage = "Sorry, Driver Rejecetd Ride";
      this.clearMessage();
      const index = this.createdRidesList.findIndex((ride) => ride._id === selectedDriver.driver._id);
      if (index !== -1) {
        this.sendingDrivers = this.sendingDrivers.filter((driver) => driver.requestId !== selectedDriver.driver._id);
        this.createdRidesList[index].status = selectedDriver.driver.status;
        this.rejectedDriversList.push(selectedDriver.driver);
        this.availableDriversList = this.availableDriversList.filter(driver => driver._id !== selectedDriver.driver.driverid);
        if(this.createdRidesList[index].assignAnyAvailable)
          {
           
           this.selectedRideId=this.createdRidesList[index]._id;
            this.assignAnyAvailableDriver()
          }
      } else {
        console.log("Ride not found in createdRidesList");
      }
    });

    this.loadRides();

  }

  loadRides() {
    // console.log('Search parameters:', this.searchByName, this.searchByNumber, this.searchById, this.searchByDate);
    const flag = true;
    this.ConfirmedRidesService.getCreatedRides(this.searchByType || '', this.searchByName || "", this.searchByNumber || "", this.searchById || '', this.searchByDate || '', this.searchByStatus || '', this.searchBySource || '', this.searchByDestination || '', this.searchByKey || '', flag).subscribe(
      (response) => {
        this.createdRidesList = response;
      }, (error) => {
        console.error("error fetching created rides", error)
      })
  }

  async listenToCronComplete(driver: any) {
    const data = await this.RunningRequestservice.getAssignedDrivers().subscribe(
      (response) => {
        this.selectedDriversList = response;
        const foundRide = this.selectedDriversList.find(d => d.driverid === driver._id);
        if (foundRide ) {
          if(foundRide.assignAnyAvailable)
            {
             
              this.nearest=true;
              var d=driver;
              d={ ...d, nearest: true };
              this.socketService.emitEvent('assignDriverNotAcceptedRejecetd', d);
            }
            else
            {
              foundRide.status = 'Reassign';
              foundRide.driverId = "";
            
                foundRide.assignedDrivers = [{
                  driverid: "",
                  assignedTime: "",
                }];
                this.nearest=false;
                this.ConfirmedRidesService.updateRide(foundRide._id, foundRide.status, foundRide.driverId, foundRide.assignedDrivers,foundRide.assignAnyAvailable)
                .subscribe(response => {
                  var data=response.data
                 data={ ...data, nearest: false };
                  this.socketService.emitEvent('assignDriverNotAcceptedRejecetd', data);
                  // this.socketService.emitEvent('holdCompleted', driver);
                });
            }
         
         
        }
      }, (error) => {
        console.error("Error feftching assigned driver", error)
      })

  }
  cancelRequest(event: Event, rid: any) {

    const foundRide = this.createdRidesList.find((id) => id._id === rid)
    if (foundRide) {
      foundRide.status = 'Cancelled';
      foundRide.driverId = "";
      foundRide.assignAnyAvailable="false";
      foundRide.assignedDrivers = [{
        driverid: "",
        assignedTime: "",
      }];

      this.ConfirmedRidesService.updateRide(rid, foundRide.status, foundRide.driverId, foundRide.assignedDrivers,foundRide.assignAnyAvailable)
        .subscribe(response => {
          this.createdRidesList = this.createdRidesList.filter(ride => ride._id !== rid);
        });
    }
    event.stopPropagation();
  }

  onRowClicked(ride: any) {
  
    this.selectedRide = ride;
    const myModal = new Modal(document.getElementById('action_modal')!);
    myModal.show();
  }

  onRowClickedDriver(driver: any) {
    this.assignanyAvailableDriver = false;
    this.selectedDriver = driver;
  }

  assignDriver(event: Event, ride: any) {
    this.selectedRideId = ride._id;
   
    this.ConfirmedRidesService.getAvailableDrivers(ride.source, ride.vtype).subscribe(
      (response) => {
       
        const checks = this.createdRidesList.find((data) => data._id === this.selectedRideId);
        const availableDrivers = response.filter((driver: any) =>
          !this.sendingDrivers.some(sendingDriver => sendingDriver._id === driver._id) &&
          !this.rejectedDriversList.some(rejectedDriver =>
            rejectedDriver._id === driver._id && rejectedDriver.requestId === this.selectedRideId
          )
        );
       
        if (checks && checks.rejectedDriverIds) {
          const rejectedDriverIds = checks.rejectedDriverIds;
          this.availableDriversList = availableDrivers.filter((driver: any) =>
            !rejectedDriverIds.includes(driver._id)
          );
        }
        else {
          this.availableDriversList = availableDrivers;
        }
       
        const requestAcceptedDriverIds = this.requestAcceptedDrivers.map(driver => driver._id);
        this.availableDriversList = this.availableDriversList.filter(driver =>
          !requestAcceptedDriverIds.some(acceptedDriverId => acceptedDriverId === driver._id)
        );
        const acceptedDriverIds = this.createdRidesList.map(driver => driver.driverid);
       
        this.availableDriversList = this.availableDriversList.filter((driver: any) =>
          !acceptedDriverIds.includes(driver._id)
        )

      }, (error) => {
        console.error("Error fetching Avalaible Drivers", error);
      })
    const myModal = new Modal(document.getElementById('action_modal_assign')!);
    myModal.show();
    event.stopPropagation();
  }

  closeModal() {
    this.assignanyAvailableDriver = true;
  }

  assignSelecteDriver() {
    this.assignanyAvailableDriver = true;
    if (this.selectedDriver) {
      this.sendingDrivers.push({ ...this.selectedDriver, requestId: this.selectedRideId });
     
      const foundRide = this.createdRidesList.find((id) => id._id === this.selectedRideId);
      if (foundRide) {
        foundRide.status = 'Sending';
        foundRide.driverId = this.selectedDriver._id;
        foundRide.assignAnyAvailable=false;
        foundRide.assignedDrivers = [{
          driverid: this.selectedDriver._id,
          assignedTime: new Date(),
        }];
        this.ConfirmedRidesService.updateRide(this.selectedRideId, foundRide.status, foundRide.driverId, foundRide.assignedDrivers,foundRide.assignAnyAvailable)
          .subscribe(response => {
            const rideIndex = this.createdRidesList.findIndex(ride => ride._id === this.selectedRideId);
            if (rideIndex !== -1) {
              this.createdRidesList[rideIndex].status = response.data.status;
              this.createdRidesList[rideIndex].dname = response.dname[0].dname[0];
              this.socketService.emitEvent('assignDriver', this.selectedDriver);
            }
          });
      }


    }
  }


  async assignAnyAvailableDriver()
  {
    this.ConfirmedRidesService.getAnyAvailableDrivers(this.selectedRideId,true).subscribe(
      (response)=>{
       const rideIndex = this.createdRidesList.findIndex(ride => ride._id === response.data._id);
            if (rideIndex !== -1) {
              this.createdRidesList[rideIndex].status = response.data.status;
              this.createdRidesList[rideIndex].dname = response.dname[0].dname[0];
              this.createdRidesList[rideIndex].assignAnyAvailable = response.data.assignAnyAvailable;
              this.createdRidesList[rideIndex].driverid = response.data.driverid;
            
              const driver=this.availableDriversList.find((driver)=>driver._id=== this.createdRidesList[rideIndex].driverid);
            
              this.sendingDrivers.push({ ...driver, requestId: this.selectedRideId });
             
              this.socketService.emitEvent('assignDriver', driver);
            }
      },(error)=>{
        console.error("Error ehilr getting drivers")
      })
  }

  listenToRideUpdated(response: any)
  {
    const rideIndex = this.createdRidesList.findIndex(ride => ride._id === response.data._id);
    if (rideIndex !== -1) {
      this.createdRidesList[rideIndex].status = response.data.status;
      if( this.createdRidesList[rideIndex].dname)
        {
          this.createdRidesList[rideIndex].dname = response.dname[0].dname[0];
          this.createdRidesList[rideIndex].assignAnyAvailable = response.data.assignAnyAvailable;
          this.createdRidesList[rideIndex].driverid = response.data.driverid;
        }
      
      this.ConfirmedRidesService.getAvailableDrivers(this.createdRidesList[rideIndex].source, this.createdRidesList[rideIndex].vtype).subscribe(
        (res)=>{
          const driver=res.find((d: any)=>d._id=== this.createdRidesList[rideIndex].driverid);
          // this.sendingDrivers.push({ ...driver, requestId: this.selectedRideId });

          this.socketService.emitEvent('assignDriver', driver);
        },(error)=>{
          console.error("error while getting drivers")
        })
     
    }
    
  }
  listenToallAssignanydriverCompleted(response: any)
  {
    const rideIndex = this.createdRidesList.findIndex(ride => ride._id === response.data._id);

    if (rideIndex !== -1) {
    
      this.createdRidesList[rideIndex].status = response.data.status;
      this.createdRidesList[rideIndex].assignAnyAvailable = response.data.assignAnyAvailable;
      this.createdRidesList[rideIndex].driverid = response.data.driverid;
    }
  }

  listenToHold(response: any)
  {
    const rideIndex = this.createdRidesList.findIndex(ride => ride._id === response.data._id);
    if (rideIndex !== -1) {
      this.createdRidesList[rideIndex].status = response.data.status; 
    }
  }
  listenToReassignAll(response: any)
  {

    const rideIndex = this.createdRidesList.findIndex(ride => ride._id === response.data._id);
    if (rideIndex !== -1) {
      this.createdRidesList[rideIndex].status = response.data.status;
      this.createdRidesList[rideIndex].driverid = response.data.driverid;
      this.sendingDrivers = this.sendingDrivers.filter((driver) => driver.requestId !== response.data._id);
    }
  }


  delay(ms: any) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus(ride: any): string {
    if (ride.selectedDriver && ride.selectedDriver.requestId === ride._id) {
      return "Sending";
    } else {
      return "Pending";
    }
  }

  isDriverAccepted(ride: any): boolean {
    return this.requestAcceptedDrivers.some(driver => driver.requestId === ride._id);
  }

  onSearch(searchByType: HTMLInputElement | String, searchByName: HTMLInputElement | String, searchByNumber: HTMLInputElement | String,
    searchById: HTMLInputElement | String, searchByDate: HTMLInputElement | String) {
    const type = typeof this.searchByType === 'string' ? searchByType : (searchByType as HTMLInputElement)?.value;
    this.searchByType = type;
    const name = typeof searchByName === 'string' ? searchByName : (searchByName as HTMLInputElement)?.value;
    this.searchByName = name;
    const number = typeof searchByNumber === 'string' ? searchByNumber : (searchByNumber as HTMLInputElement)?.value;
    this.searchByNumber = number;
    const id = typeof searchById === 'string' ? searchById : (searchById as HTMLInputElement)?.value;
    this.searchById = id;
    const date = typeof searchByDate === 'string' ? searchByDate : (searchByDate as HTMLInputElement)?.value;
    this.searchByDate = date;
    this.loadRides();
  }

  handleAction(event: Event, ride: any) {
    this.status = ride.status;
    event.stopPropagation();
    const selectedStatus = (event.target as HTMLSelectElement).value;
      const assignedDrivers = [{
        driverid: "",
        assignedTime: "",
      }];
  
    this.ConfirmedRidesService.updateRide(ride._id, selectedStatus, ride.driverid,assignedDrivers,ride.assignAnyAvailable)
      .subscribe(response => {
        const rideIndex = this.createdRidesList.findIndex(r => r._id === ride._id);
        this.createdRidesList[rideIndex].status = response.data.status; 
        if (rideIndex !== -1) {
          const unumber=this.createdRidesList[rideIndex].unumber;
          if(selectedStatus==='Started')
          {
            const formDataSms= new FormData;
            formDataSms.append("to",unumber);
            formDataSms.append("body","Driver Satrted Request");
            this.SendSms(formDataSms);
            this.ConfirmedRidesService.driverStarted().subscribe(
              (res)=>{
                console.log(res);
              },(err)=>{
                console.error(err);
              })
          }
          if (selectedStatus === 'Completed') {
            const email=this.createdRidesList[rideIndex].uemail;
            const name=this.createdRidesList[rideIndex].uname;
            const option= this.createdRidesList[rideIndex].option;
            if(option==="card")
            {
              const userid= this.createdRidesList[rideIndex].userid;
              const estimateFare= this.createdRidesList[rideIndex].estimateFare;
              this.ConfirmedRidesService.makePayment(userid,estimateFare ).subscribe(
              (response)=>{
               if(!response.message)
               {
                window.location.href = response;
               }

                const formDataSms= new FormData;
              formDataSms.append("to",unumber);
              formDataSms.append("body",`Payment done of Rs.${estimateFare}`)
              this.SendSms(formDataSms);
              },(error)=>{
                console.error("Error making payment" , error);
              })
            }
            this.createdRidesList[rideIndex].status = response.data.status;
            this.createdRidesList = this.createdRidesList.filter(r => r._id !== ride._id);
            this.acceptedMessage="Ride Completed";
            const formDataEmail = new FormData();
            formDataEmail.append('to', email);
            formDataEmail.append('subject', "Ride Completed");
            formDataEmail.append('text', `Dear ${name},\n We're delighted to inform you that your ride has been successfully completed.Thank you for choosing us as your travel partner.\n
             We hope you enjoyed the journey with us! If you have any feedback or queries regarding your ride experience, feel free to reach out to us \nBest regards,Elluminati inc.`);

            this.SendEmailService.sendEmail(formDataEmail).subscribe(
              (response)=>{
                console.log(response.message);
              },(error)=>{
                console.error("Error sending mail", error)
              });

              const formDataSms= new FormData;
              formDataSms.append("to",unumber);
              formDataSms.append("body","Driver Completed Request")
              this.SendSms(formDataSms);
            this.clearMessage();
            this.sendingDrivers = this.sendingDrivers.filter((driver) => driver.requestId !== ride._id);
          }
          this.cdr.detectChanges();
        }
      });
  }

  SendSms(formData: FormData) {

    this.SendSmsService.sendSms(formData).subscribe(
      (response) => {
        console.log(response.message);
      }, (error) => {
        console.error("Error sending sms", error)
      });
  }

  resetForm(form: any) {

    form.resetForm();
    this.searchByType = '';
    this.searchByName = '';
    this.searchByNumber = '';
    this.searchById = '';
    this.searchByDate = '';
    this.loadRides();
  }

  clearMessage() {
    setTimeout(() => {
      this.message = '';
      this.notAcceptedRejecetedMessage = "";
      this.acceptedMessage = "";
      this.rejectedMessage = "";
      this.same='';
    }, 3000);
  }

}
