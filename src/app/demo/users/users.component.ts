import { Component, ViewChild,ViewChildren, QueryList, HostListener,ElementRef } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { ChangeDetectorRef } from '@angular/core';
import { SessionService } from 'src/app/services/session.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Modal } from 'bootstrap';
import { SendEmailService } from 'src/app/services/send-email.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent {
  @ViewChild('users') userForm: any;
  @ViewChildren('actionSelect') actionSelects!: QueryList<ElementRef>;
  form = {
    uprofile: null as File | null,
    uname: '',
    uemail: '',
    unumber: '',
  }
  handler: any=null;
  UsersList: any[] = [];
  NewUsersList: any[] = [];
  selectedUser: any = {};
  emailExists = '';
  numberExists = '';
  countryCodes: string[] = [];
  selectedCountryCode: string = '';
  imageName: any;
  isEdit = false;
  message = '';
  searchMessage = '';
  fileSizeMessage = '';
  maxSizeInBytes = 1024 * 1024;
  currentPage = 1;
  totalPages = 0;
  pageSize = 5;
  searchText: string = '';
  sortText: string = '';
  isLast=false;
  isCard=false;
  default=false;
  cards: any[] = [];
  selectedUserCard: any;
  pkey: any;
  constructor(private UsersService: UsersService, private cdr: ChangeDetectorRef,
   private SessionService: SessionService,private modalService: NgbModal, private SendEmailService: SendEmailService ) { }
 

  @HostListener('window:keydown')
  onKeydown(): void {
    this.SessionService.resetSessionTimer();
  }

  @HostListener('window:mousemove')
  onUserActivity(): void {
    this.SessionService.resetSessionTimer();
  }
  
  ngOnInit() {
    this.UsersService.getPublishKey().subscribe(
      (res)=>{
         this.pkey=res;
      },(err)=>{
        console.error("error loading publish key", err)
      })
    this.loadUsers();
    this.countryCallingCode();
    this.selectedUser = {};
  }

  
  onFileChange(event: any) {
    this.fileSizeMessage = "";
    const files = event.target.files;
    if (files && files.length > 0) {
      this.form.uprofile = files[0] as File;

      if (this.form.uprofile.size > this.maxSizeInBytes) {
        this.fileSizeMessage = "File size exceeds the allowed limit (1 MB)"
        console.error('File size exceeds the allowed limit (1 MB)');
        event.target.value = '';
        return;
      }
      this.selectedUser.uprofile = this.form.uprofile.name;
    }
  }

  loadUsers() {
    // console.log("Users")
    this.UsersService.getUsers(this.searchText || '', this.sortText || '', this.currentPage, this.pageSize).subscribe(
      (response: any) => {
        console.log("filtered",response);
        this.UsersList = response.users;
        if(this.UsersList.length==0 && this.searchText)
        {
          this.searchMessage="No Data Found!!!";
          this.clearMessageAfterTimeout();
        }
        this.totalPages = response.totalPages;
      },
      (error) => {
        console.error('Error loading users:', error);
      }
    );
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUsers();

    }
  }

  countryCallingCode() {
    this.UsersService.getCCCode().subscribe(
      (response) => {
        // console.log("calling code",response.map((code)=>code.countryCallingCode));
        this.countryCodes = response.map((code) => code.countryCallingCode);
      },
      (error) => {
        console.error('Error loading country code:', error);
      }
    );
  }
  onCountryCodeChange() {
    setTimeout(() => {
      this.numberExists = '';
    }, 100);
  }

  editUser(user: any) {
    this.selectedUser = { ...user };

    this.form.uname = this.selectedUser.uname;
    this.form.uemail = this.selectedUser.uemail;
    const phoneNumberLength = 10;
    const unumberString = String(this.selectedUser.unumber);
    this.selectedCountryCode = unumberString.slice(0, unumberString.length - phoneNumberLength);
    //  console.log(this.selectedCountryCode)
    this.form.unumber = unumberString.slice(unumberString.length - phoneNumberLength);
    this.isEdit = true;

    if (this.selectedUser.uprofile) {
      this.imageName = this.selectedUser.uprofile.split('/').pop();
      this.form.uprofile = this.imageName;
      const existingUprofile = this.selectedUser.uprofile;
    } else {
      this.form.uprofile = null;
    }
  }

  deleteUser(id: string) {
    const del = confirm("Are you sure you want to delete record?");
    if (del) {
      this.UsersService.deleteUser(id).subscribe(
        (response) => {
          if (response && response.message === "User deleted successfully") {
            console.log(response.message);
            this.UsersList = this.UsersList.filter(user => user._id !== id);
          
            this.cdr.detectChanges();
            this.message = response.message;
              if (this.UsersList.length == 0 && this.totalPages>1) {
                this.currentPage--;
                this.loadUsers();
              }
              else if(this.UsersList.length==0 && this.searchText && this.totalPages<=1)
              {
                this.searchMessage=`No Data Left of ${this.searchText}`
              }
              else {
                this.loadUsers();
              }
            
            this.clearMessageAfterTimeout();
          } else {
            alert("Error deleting record");
          }
        },
        (error) => {
          console.log("Error deleting User:", error);
        }
      )
    }
  }
  addUser() {
    const formData = new FormData();
    formData.append('uprofile', this.form.uprofile || '');
    formData.append('uname', this.form.uname);
    formData.append('uemail', this.form.uemail);
    formData.append('unumber', this.selectedCountryCode + this.form.unumber);
    
    const email=this.form.uemail;
    if (this.isEdit && this.selectedUser.uprofile) {
  
      // console.log(this.selectedUser.uprofile);
      formData.append('existingUprofile', this.selectedUser.uprofile);
    }
    if (this.selectedUser._id) {
      this.UsersService.editUser(this.selectedUser._id, formData).subscribe(
        (response) => {
          console.log(response.message);
          this.userForm.resetForm();
          this.userForm.unumber = '';
          this.selectedCountryCode = "";
          this.message = response.message;
  
          this.cdr.detectChanges();
          this.message = response.message;
    
          const match = response.data.uname.includes(this.searchText) || 
          response.data.unumber.includes(this.searchText) || 
          response.data.uemail.includes(this.searchText);
          if(this.currentPage>1 && !match)
          {
            this.currentPage--;
          }
            this.loadUsers();

          this.clearMessageAfterTimeout();
          this.userForm.resetForm();
          this.userForm.unumber = '';
          this.selectedCountryCode = "";
          this.isEdit = false;
          this.selectedUser = {};
        },
        (error) => {
          console.error('Error editing user:', error);
          if (error.error.messages) {
            this.emailExists = error.error.messages.includes('Email already exists.') ? 'Email already exists.' : '';
            this.numberExists = error.error.messages.includes('Number already exists.') ? 'Number already exists.' : '';
          }
        }
      );
    } else {
      this.UsersService.addUser(formData).subscribe(
        (response) => {
          console.log(response.message);
           
            const formDataRegister = new FormData();
            formDataRegister.append('to', email);
            formDataRegister.append('subject', "Welcome to Elluminati Inc.");
            formDataRegister.append('text', `Hello ${this.form.uname},\n Welcome aboard! 🚕🎉 Thank you for choosing Elluminati Inc. for your taxi and car booking needs. We're here to make your travels smoother and more enjoyable.\n Happy travels! \nBest regards,\nElluminati inc.`);
            this.SendEmailService.sendEmail(formDataRegister).subscribe(
              (response)=>{
                console.log(response.message);
              },(error)=>{
                console.error("Error sending mail", error)
              })
              this.loadUsers();
          this.userForm.resetForm();
          this.userForm.unumber = '';
          this.selectedCountryCode = '';
          this.message = response.message;
          this.clearMessageAfterTimeout();
        },
        (error) => {
          console.error('Error adding User:', error);
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

    this.loadUsers();
  }

  onSort(sortText) {
    this.sortText=sortText;
    this.loadUsers();
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
  
displayCards(user: any)
{
   this.UsersService.getCards(user._id).subscribe(
    (response)=>{
        this.cards = response;
        this.selectedUserCard=user;
        const defaultCardIndex = this.cards.findIndex(card => card.default);
        if (defaultCardIndex !== -1) {
          const defaultCard = this.cards[defaultCardIndex];
          this.cards.splice(defaultCardIndex, 1);
          this.cards.unshift(defaultCard);
        }
        this.handleSingleCardDefault();
        const myModal = new Modal(document.getElementById('action_modal')!);
        myModal.show();
    },(error)=>{
     console.error("Error while displaying cards:",error);
    })
}
  addCard() {
    
    if (!(<any>window).StripeCheckout) {
      
      var s = window.document.createElement("script");
      s.id = "stripe-script";
      s.type = "text/javascript";
      s.src = "https://checkout.stripe.com/checkout.js";
      s.onload = () => {
       
        if ((<any>window).StripeCheckout) {
          this.initializeStripeHandler(this.selectedUserCard);
        } else {
          console.error('StripeCheckout is not available');
        }
      };
  
      s.onerror = (error) => {
        console.error('Error loading Stripe Checkout script', error);
      };
  
      window.document.body.appendChild(s);
    } else {
    
      this.initializeStripeHandler(this.selectedUserCard);
    }
  }
  
  initializeStripeHandler(user: any) {
    
    this.handler = (<any>window).StripeCheckout.configure({
      key: this.pkey,
      locale: 'auto',
      token: (token: any) => {
        this.UsersService.addCard({ stripeCardToken: token.id },user._id).subscribe(
          (response)=>{
            console.log(response);     
            this.selectedUser='';
           
          },(error)=>{
            console.error("error while adding card", error);
        })
         alert('Card Added!!');
      }
    });
  
    this.handler.open({
      name: 'Add Card',
      description: 'Add Card for: ' + user.uname,
      email: user.uemail,
      panelLabel: 'Add Card',
    });
  }

  setDefaultCard(card: any) {
  
    this.UsersService.setDefaultCard(card.cardId, this.selectedUserCard._id).subscribe(
      (response) => {
        console.log(response.message);

        this.cards.forEach((c) => {
          c.default = c.cardId === card.cardId;
        });
        
      },
      (error) => {
        console.error("Error setting default card", error);
      }
    );
  }
  
  selectDefaultCard(card: any) {
    this.setDefaultCard(card);
  }
  handleSingleCardDefault() {
    if (this.cards.length === 1) {
      const defaultCard = this.cards[0];
      if (!defaultCard.default) {
        if (!this.cards.some(card => card.default)) {
          this.setDefaultCard(defaultCard);
        }
      }
    }
  }
  

  deleteCard(cardId: string, userId: string) {
    const del = confirm("Are you sure you want to delete record?");
    if (del) {
      this.UsersService.deleteCard(userId,cardId ).subscribe(
        (response) => {
          if (response && response.message === "Card deleted successfully") {
            alert("Card Deleted Successfully");
            console.log(response.message);
            this.cards = this.cards.filter(card => card._id !== cardId);
           
          } else {
            alert("Error deleting record");
          }
        },
        (error) => {
          console.error("Error deleting user:", error);
        }
      )
    }
  }

  handleAction(user: any, event: Event, index:number) {
    event.preventDefault();
    const selectedAction = (event.target as HTMLSelectElement).value;

    if (selectedAction === 'edit') {
      this.editUser(user);
    } else if (selectedAction === 'delete') {
      this.deleteUser(user._id);
    } else if (selectedAction === 'card') {
      this.selectedUserCard=user;
      this.displayCards(user);
    } 
    const dropdown = this.actionSelects.toArray()[index].nativeElement as HTMLSelectElement;
    dropdown.value = '';
  }

  handleSort(event: Event) {
    const selectedSort = (event.target as HTMLSelectElement).value;

    if (selectedSort === 'uname') {
      this.onSort(selectedSort);
    } else if (selectedSort === 'uemail') {
      this.onSort(selectedSort);
    }
    else if (selectedSort === 'unumber') {
      this.onSort(selectedSort);
    }
  }
  resetForm(form: any) {
    this.searchMessage = '';
    this.currentPage=1;
    form.resetForm();
    this.searchText = '';
    this.loadUsers();
  }

  resetSort(form: any)
  {
    this.currentPage=1;
    form.resetForm();
    this.sortText = '';
    this.loadUsers();
  }
}