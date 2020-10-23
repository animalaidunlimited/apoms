import { Component, OnInit } from '@angular/core';
import { UserDetailsService } from 'src/app/core/services/user-details/user-details.service';
import { Team, UserJobType } from 'src/app/core/models/userDetails';
import { FormBuilder, Validators } from '@angular/forms';
import { UserActionService } from 'src/app/core/services/user-details/user-action.service';

interface StreetTreatRole {
  roleId: number;
  roleName: string;
}


@Component({
    selector: 'app-users-page',
    templateUrl: './users-page.component.html',
    styleUrls: ['./users-page.component.scss'],
})
export class UsersPageComponent implements OnInit {
    teamNames!: Team[];
    jobTypes!: UserJobType[];
    hide = true;
    constructor(private userDetail : UserDetailsService,
      private fb : FormBuilder,
      private userAction : UserActionService) {}

    userDetails = this.fb.group({
      userId : [],
      firstName : ['',Validators.required],
      lastName: ['',Validators.required],
      userInitials: ['',Validators.required],
      phoneNumber:[,Validators.required],
      userName:['',Validators.required],
      password: ['',Validators.required],
      userColor:['',Validators.required],
      teamId:[,Validators.required],
      streetTreatRoleId:[,Validators.required],
      userJobTypeId:[,Validators.required]
    });

    streettreatRoles: StreetTreatRole[] = [{
      roleId: 1 , roleName: 'Admin'
    },{
      roleId: 2 , roleName: 'Operator'
    }];

    ngOnInit() {
        this.userDetail.getAllTeams().subscribe(team=>{
          this.teamNames = team;
        });
        this.userDetail.getUserJobType().subscribe(jobType=>{
          this.jobTypes = jobType;
        });
    }

    Submit(userDetailsForm: any) {
      this.userAction.insertUser(userDetailsForm.value);
    }
}
