import { Component, OnInit, Input } from '@angular/core';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { ReleaseManager } from 'src/app/core/models/user';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';


interface User {
  userName:string;
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'release-request-form',
  templateUrl: './release-request-form.component.html',
  styleUrls: ['./release-request-form.component.scss']
})
export class ReleaseRequestFormComponent implements OnInit {

  @Input() recordForm!: FormGroup;
  @Input() incomingFormData!: Observable<any>;
  releaseManagers$!: Observable<ReleaseManager[]>;

  releaseRequestForm!: FormGroup;

  constructor(private userService: UserOptionsService,
    private fb: FormBuilder,
    private dropdown: DropdownService) { }

  // imagePath: any = 'src/assets/Dogface.jpg';

  userList: User[] = [{userName:'Claire'},
    {userName:'Neha'},
    {userName: 'Guja'},
    {userName: 'Rachael'}];

  username: any = this.userService.getUserName();

  ngOnInit() {

    this.releaseManagers$ = this.dropdown.getReleaseManagers();

    this.userList.push({
      userName: this.username
    });

    this.recordForm.addControl(
      'releaseRequestForm',
      this.fb.group({
        requestedUser: [],
        requestedDate: ['']
      })
    );

    this.releaseRequestForm = this.recordForm.get('releaseRequestForm') as FormGroup;

    this.incomingFormData.subscribe((formVal: any)=>{
      if(formVal) {
        this.releaseRequestForm.patchValue(formVal);
      }
      else {
        this.releaseRequestForm.patchValue({
              requestedUser: this.username,
              requestedDate: (new Date()).toISOString().substring(0,10)
            });
      }
    });
    
  }
  
}
