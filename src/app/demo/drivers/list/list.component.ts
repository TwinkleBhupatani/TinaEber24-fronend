import { Component, ViewChild,ViewChildren,QueryList, ElementRef, HostListener } from '@angular/core';
import { ListService } from '../../../services/list.service';
import { ChangeDetectorRef } from '@angular/core';
import { Modal } from 'bootstrap';
import { SessionService } from '../../../services/session.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent {
  @ViewChild('drivers') driverForm: any;
  @ViewChild('typeForm') typeForm: any;
  @ViewChildren('actionSelect') actionSelects!: QueryList<ElementRef>;
  constructor(private ListService: ListService,
     private cdr: ChangeDetectorRef, private SessionService: SessionService) { }

  private approvalStatusMap: Map<string, boolean> = new Map<string, boolean>()
  @HostListener('window:keydown')
  onKeydown(): void {
    this.SessionService.resetSessionTimer();
  }

  @HostListener('window:mousemove')
  onUserActivity(): void {
    this.SessionService.resetSessionTimer();
  }
  accountNumber: string;
  routingNumber: string;
  accountHolderName: string;
  form = {
    dprofile: null as File | null,
    dname: '',
    demail: '',
    dnumber: '',
    dcity: '',
    dcityid: '',
    approved: ''
  }
  DriversList: any[] = [];
  NewDriversList: any[] = [];
  cityList: any[] = [];
  newTypeList: any[] = [];
  typeList: any[] = [];
  selectedType: any
  selectedTypeDriverId: string = '';
  assignedVehicleName: string = '';
  priceSetData: any[] = [];
  priceSetVtype: any[] = [];
  assignedTypeId: any[] = [];
  selectedDriver: any = {};
  emailExists = '';
  numberExists = '';
  countryCodes: string[] = [];
  selectedCountryCode: string = '';
  selectedCity: any;
  imageName: any;
  isEdit = false;
  message = '';
  status = "";
  searchMessage = '';
  fileSizeMessage = '';
  maxSizeInBytes = 1024 * 1024;
  currentPage = 1;
  totalPages = 0;
  pageSize = 5;
  searchText: string = '';
  sortText: string = '';
  isLast = false;

  ngOnInit() {
    this.loadDrivers();
    this.countryCallingCode();
    this.selectedDriver = {};
    this.selectedType = "";
  }
  addBankAccount() {
    const bankAccountInfo = {
      accountNumber: this.accountNumber,
      routingNumber: this.routingNumber,
      accountHolderName: this.accountHolderName
    };
    this.ListService.addBankAccount(bankAccountInfo).subscribe(
      (res)=>{
        console.log(res);
      },(err)=>{
        console.error(err);
      })
  }

 
  onFileChange(event: any) {
    this.fileSizeMessage = "";
    const files = event.target.files;
    if (files && files.length > 0) {
      this.form.dprofile = files[0] as File;

      if (this.form.dprofile.size > this.maxSizeInBytes) {
        this.fileSizeMessage = "File size exceeds the allowed limit (1 MB)"
        console.error('File size exceeds the allowed limit (1 MB)');
        event.target.value = '';
        return;
      }
      this.selectedDriver.dprofile = this.form.dprofile.name;
    }
  }

  loadDrivers() {
    this.assignedVehicleName = "";
    this.ListService.getDrivers(this.searchText || '', this.sortText || '', this.currentPage, this.pageSize).subscribe(
      (response: any) => {
        // console.log("filtered", response);
        this.DriversList = response.drivers;
        if (this.DriversList.length == 0 && this.searchText) {
          this.searchMessage = "No Data Found!!!";
          this.clearMessageAfterTimeout();
        }
        this.DriversList.forEach(driver => {
          this.approvalStatusMap.set(driver._id, driver.approved);
        });
        this.totalPages = response.totalPages;
      },
      (error) => {
        console.error('Error loading drivers:', error);
      }
    );
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadDrivers();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadDrivers();
    }
  }

  countryCallingCode() {
    this.ListService.getCCCode().subscribe(
      (response) => {
        this.countryCodes = response.map((code) => code.countryCallingCode);
      },
      (error) => {
        console.error('Error loading country code:', error);
      }
    );
  }
  onCountryCodeChange() {
    this.ListService.getCountryId().subscribe(
      (response) => {
        const selectedId = response.find((id) => this.selectedCountryCode === id.countryCallingCode)._id;
        this.ListService.getCity(selectedId).subscribe(
          (response) => {
            this.cityList = response;
            // console.log(this.cityList)
          }, (error) => {
            console.error('Error loading city:', error);
          })
      }, (error) => {
        console.error('Error loading country:', error);
      })
    setTimeout(() => {
      this.numberExists = '';
    }, 100);
  }

  onCityChange() {

    this.selectedCity = this.form.dcity;
    const city = this.cityList.find((city: any) => city.city === this.selectedCity);
    if (city) {
      this.form.dcityid = city._id;
    }
   
  }

  toggleApproval(driverId: string): void {

    this.ListService.toggleApproval(driverId).subscribe(
      (updatedDriver) => {
        const index = this.DriversList.findIndex(driver => driver._id === driverId);
        if (index !== -1) {
          this.DriversList[index].approved = updatedDriver.driver.approved;
          this.approvalStatusMap.set(driverId, updatedDriver.driver.approved);
        }
      },
      (error) => {
        console.error('Error updating driver approval status:', error);
      }
    );
  }

  getStatus(driverId: string): string {
    const approvalStatus = this.approvalStatusMap.get(driverId);
    return approvalStatus ? "Approved" : "Declined";
  }

  assignVehicle(driverId: string, dcityid: string): void {
    this.selectedTypeDriverId = driverId;
    this.ListService.getTypesByCityVehcilePriceSet(driverId, dcityid).subscribe(
      (response: any) => {
        this.priceSetData=response.dataVtype;
        this.priceSetVtype = this.priceSetData.map((type: any) => type.vtype);
      }, (error) => {
        console.error("error getting type", error)
      })
    this.ListService.getAssignedType(driverId).subscribe(
      (response) => {
       this.assignedVehicleName=response;
       if(this.assignedVehicleName.length===0)
       {
        this.selectedType="";
       }
      else
      {
        this.selectedType = this.assignedVehicleName;

      }
       const myModal = new Modal(document.getElementById('action_modal')!);
       myModal.show();
      },
      (error) => {
        console.error('Error fetching assigned vehicle:', error);
      }
    );
    // const myModal = new Modal(document.getElementById('action_modal')!);
    // myModal.show();
  }

  onSubmit(form: any) {
    if (this.selectedTypeDriverId && this.selectedType) {
      this.assignedTypeId=this.priceSetData.find((type)=>type.vtype==this.selectedType)._id;;
      this.ListService.assignType(this.selectedTypeDriverId, this.assignedTypeId).subscribe(
        (response) => {
          console.log(response.message);
          this.selectedType = '';
          this.assignedVehicleName = "";
          this.typeForm.name = "";
        },
        (error) => {
          console.error('Error assigning service type:', error);
        }
      );
    }
  }


  editDriver(user: any) {
    // console.log(user)
    this.selectedDriver = { ...user };
    this.form.dname = this.selectedDriver.dname;
    this.form.demail = this.selectedDriver.demail;
    this.form.dcity = this.selectedDriver.dcity;
    this.form.dcityid = this.selectedDriver.dcityid;
    const phoneNumberLength = 10;
    const dnumberString = String(this.selectedDriver.dnumber);
    this.selectedCountryCode = dnumberString.slice(0, dnumberString.length - phoneNumberLength);
    this.form.dnumber = dnumberString.slice(dnumberString.length - phoneNumberLength);
    this.isEdit = true;

    if (this.selectedDriver.dprofile) {
      this.imageName = this.selectedDriver.dprofile.split('/').pop();
      this.form.dprofile = this.imageName;
      const existingDprofile = this.selectedDriver.dprofile;
    } else {
      this.form.dprofile = null;
    }
  }

  deleteDriver(id: string) {
    const del = confirm("Are you sure you want to delete record?");
    if (del) {
      this.ListService.deleteDriver(id).subscribe(
        (response) => {
          if (response && response.message === "Driver deleted successfully") {
            console.log(response.message);
            this.DriversList = this.DriversList.filter(user => user._id !== id);

            this.cdr.detectChanges();
            this.message = response.message;

            if (this.DriversList.length == 0 && this.totalPages > 1) {
              this.currentPage--;
              this.loadDrivers();
            }
            else if (this.DriversList.length == 0 && this.searchText && this.totalPages <= 1) {
              this.searchMessage = `No Data Left of ${this.searchText}`
            }
            else {
              this.loadDrivers();
            }

            this.clearMessageAfterTimeout();
          } else {
            alert("Error deleting record");
          }
        },
        (error) => {
          console.log("Error deleting Driver:", error);
        }
      )
    }
  }
  addDriver() {
    const formData = new FormData();
    formData.append('dprofile', this.form.dprofile || '');
    formData.append('dname', this.form.dname);
    formData.append('demail', this.form.demail);
    formData.append('dnumber', this.selectedCountryCode + this.form.dnumber);
    formData.append('dcity', this.form.dcity);
    formData.append('dcityid', this.form.dcityid);
    if (this.isEdit && this.selectedDriver.dprofile) {
      formData.append('existingDprofile', this.selectedDriver.dprofile);
    }
    if (this.selectedDriver._id) {
      this.isEdit = true;
      this.ListService.editDriver(this.selectedDriver._id, formData).subscribe(
        (response) => {
          console.log(response.message);

          this.cdr.detectChanges();
          this.message = response.message;

          const match = response.data.dname.includes(this.searchText) ||
            response.data.dcity.includes(this.searchText) ||
            response.data.dnumber.includes(this.searchText) ||
            response.data.demail.includes(this.searchText)
          if (this.currentPage > 1 && !match) {
            this.currentPage--;
          }
          this.loadDrivers();

          this.clearMessageAfterTimeout();
          this.driverForm.resetForm();
          this.driverForm.dnumber = '';
          this.driverForm.dcity = '';
          this.selectedCountryCode = "";
          this.cityList = [""];
          this.isEdit = false;
          this.selectedDriver = {};

        },
        (error) => {
          console.error('Error editing Driver:', error);
          if (error.error.messages) {
            this.emailExists = error.error.messages.includes('Email already exists.') ? 'Email already exists.' : '';
            this.numberExists = error.error.messages.includes('Number already exists.') ? 'Number already exists.' : '';
          }
        }
      );
    } else { 
      this.selectedType = "";
      this.assignedVehicleName = "";
      this.ListService.addDriver(formData).subscribe(
        (response) => {
          console.log(response.message);

          this.loadDrivers();

          this.driverForm.resetForm();
          this.driverForm.dnumber = '';
          this.driverForm.dcity = '';
          this.cityList = [""];
          this.cdr.detectChanges();
          this.selectedCountryCode = '';
          this.message = response.message;
          this.clearMessageAfterTimeout();

        },
        (error) => {
          console.error('Error adding Driver:', error);
          if (error.error.messages) {
            this.emailExists = error.error.messages.includes('Email already exists.') ? 'Email already exists.' : '';
            this.numberExists = error.error.messages.includes('Number already exists.') ? 'Number already exists.' : '';
          }
        }
      );
    }


  }

  onSearch(searchText: HTMLInputElement | String) {

    this.searchMessage = '';
    const searchValue = typeof searchText === 'string' ? searchText : (searchText as HTMLInputElement).value;
    this.searchText = searchValue;

    this.loadDrivers();
  }

  onSort(sortText) {
    // console.log(sortText);
    this.sortText = sortText;
    this.loadDrivers();
  }

  clearMessageAfterTimeout(): void {
    setTimeout(() => {
      this.message = null;
      this.searchMessage = "";
    }, 3000)
  }
  clearErrors() {
    this.emailExists = '';
    this.numberExists = '';
  }

  handleAction(driver: any, event: Event, index: number) {
    const selectedAction = (event.target as HTMLSelectElement).value;

    if (selectedAction === 'edit') {
      this.editDriver(driver);
    } else if (selectedAction === 'delete') {
      this.deleteDriver(driver._id);
    } else if (selectedAction === 'assign') {
      this.assignVehicle(driver._id, driver.dcityid);
    }
    const dropdown = this.actionSelects.toArray()[index].nativeElement as HTMLSelectElement;
  dropdown.value = '';
  }

  handleSort(event: Event) {
    const selectedSort = (event.target as HTMLSelectElement).value;

    if (selectedSort === 'dname') {
      this.onSort(selectedSort);
    } else if (selectedSort === 'demail') {
      this.onSort(selectedSort);
    }
    else if (selectedSort === 'dnumber') {
      this.onSort(selectedSort);
    }
    else if (selectedSort === 'dcity') {
      this.onSort(selectedSort);
    }
  }
  resetForm(form: any) {
    this.searchMessage = '';
    this.currentPage = 1;
    form.resetForm();
    this.searchText = '';
    this.loadDrivers();
  }

  resetSort(form: any)
  {
    this.currentPage=1;
    form.resetForm();
    this.sortText = '';
    this.loadDrivers();
  }
}
