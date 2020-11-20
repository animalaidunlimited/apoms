import { Component, OnInit, Input } from '@angular/core';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { getCurrentTimeString } from 'src/app/core/helpers/utils';


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

  releaseRequestForm!: FormGroup;

  constructor(private userService: UserOptionsService,
    private fb: FormBuilder) { }

  // imagePath: any = 'src/assets/Dogface.jpg';

  userList: User[] = [{userName:'Claire'},
    {userName:'Neha'},
    {userName: 'Guja'},
    {userName: 'Rachael'}];

  username: any = this.userService.getUserName();

  ngOnInit() {

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

    this.releaseRequestForm.patchValue({
      requestedUser: this.username,
      requestedDate: (new Date()).toISOString().substring(0,10)
    });
  }
  
}
