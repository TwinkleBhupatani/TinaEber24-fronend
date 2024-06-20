import { Component,HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettinsService } from '../../services/settings.service';
import {SessionService} from '../../services/session.service'
declare var google: any;
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent{

  settingsForm : FormGroup;
   successMessage: any;
   secondsList=[10,20,30,45,60,90,120];
   stopsList=[1,2,3,4,5];
  constructor(private fb: FormBuilder, private SettingsService: SettinsService, private SessionService: SessionService){}
  
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
    
  }



  initForm() {
    this.settingsForm = this.fb.group({
      seconds: ['', Validators.required],
      stops:['',Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      sid: ['', Validators.required],
      authToken: ['', Validators.required],
      number: ['', Validators.required],
      pkey: ['', Validators.required],
      skey: ['', Validators.required],
    });
  }

  set()
  {
    if(this.settingsForm.valid)
    {
      const settingsData = this.settingsForm.value;
      // console.log(settingsData);
      this.SettingsService.addSettings(settingsData).subscribe(
        (response)=>{
          console.log(response.message);
          this.successMessage=response.message;
          this.clearMessageAfterTimeout();
          this.settingsForm.reset();
          this.settingsForm.get('seconds')?.setValue('');
          this.settingsForm.get('stops')?.setValue('');
       },
        (error)=>{
        console.error("Error while adding data", error);  
      });
    }
  }
  clearMessageAfterTimeout(): void
  {
    setTimeout(()=>{
      this.successMessage=null;
    },3000)
  }
}
