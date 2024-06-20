import { Component, ViewChild,HostListener } from '@angular/core';
import { VehicleTypeService } from '../../../services/vehicle-type.service';
import {SessionService} from '../../../services/session.service';

@Component({
  selector: 'app-vehicle-type',
  templateUrl: './vehicle-type.component.html',
  styleUrls: ['./vehicle-type.component.scss'],
})
export class VehicleTypeComponent {
  @ViewChild('vehicleTypes') vehicleTypesForm: any; 
  form={
    vicon: null as File | null, 
    vtype: '', 
  }
  vehicleList: any[] = [];
  selectedVehicle: any = {}; 
  imageName: any;
  isEdit=false;
  maxSizeInBytes = 1024 * 1024; 
  selectedImage: any;
  constructor(private vehicleTypeService: VehicleTypeService, private SessionService: SessionService) {}
  @HostListener('window:keydown')
  onKeydown(): void {
    this.SessionService.resetSessionTimer();
  }

  @HostListener('window:mousemove')
  onUserActivity(): void {
    this.SessionService.resetSessionTimer();
  }
  ngOnInit() {
    this.loadVehicleTypes();
    this.selectedVehicle = {};
  }

  onFileChange(event: any) {
     const files = event.target.files;
  if (files && files.length > 0) {
    const file = files[0];
    this.form.vicon = files[0] as File;

    if (this.form.vicon.size > this.maxSizeInBytes) {
      console.error('File size exceeds the allowed limit (1 MB)');
      event.target.value = '';
      return;
    }

    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedImageTypes.includes(this.form.vicon.type)) {

      console.error('Invalid file type. Please select an image (JPEG, PNG, GIF).');
  
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.selectedImage = reader.result;
    };
    reader.readAsDataURL(file);
    this.selectedVehicle.vicon = this.form.vicon.name;
  }
  }


  editVehicle(vehicle: any) {
    this.selectedVehicle = { ...vehicle };
    this.form.vtype = this.selectedVehicle.vtype;
     this.isEdit=true;
    if (this.selectedVehicle.vicon) {
       this.imageName = this.selectedVehicle.vicon.split('/').pop();
       this.form.vicon = this.imageName;
      const existingVicon = this.selectedVehicle.vicon;
    } else {
      this.form.vicon = null;
    }
  }
  

  loadVehicleTypes() {
    this.vehicleTypeService.getVehicleTypes().subscribe(
      (response) => {
        this.vehicleList = response;
      },
      (error) => {
        console.error('Error loading vehicle types:', error);
      }
    );
  }

  addVehicleType() {
    const formData = new FormData();
    formData.append('vicon', this.form.vicon || '');
    formData.append('vtype', this.form.vtype);
    if (this.isEdit && this.selectedVehicle.vicon) {
      formData.append('existingVicon', this.selectedVehicle.vicon);
    }
    if (this.selectedVehicle._id) {
        this.vehicleTypeService.editVehicleType(this.selectedVehicle._id, formData).subscribe(
            (response) => {
                console.log(response.message); 
                this.loadVehicleTypes();
                this.isEdit=false;
            },
            (error) => {
                console.error('Error editing vehicle type:', error);
            }
        );
    } else {
        this.vehicleTypeService.addVehicleType(formData).subscribe(
            (response) => {
                console.log(response.message);
                this.loadVehicleTypes();
            },
            (error) => {
                console.error('Error adding vehicle type:', error);
            }
        );
    }
    this.vehicleTypesForm.resetForm();
    this.selectedVehicle = {};
}

}
