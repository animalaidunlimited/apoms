import { Component, OnInit } from '@angular/core';
import { UserDetailsService } from 'src/app/core/services/user-details/user-details.service';
import { Team, UserJobType } from 'src/app/core/models/userDetails';
import { FormBuilder, Validators } from '@angular/forms';
import { UserActionService } from 'src/app/core/services/user-details/user-action.service';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';

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
    streetTreatdropdown = false;
    isChecked = true;
    constructor(private dropdown : DropdownService,
      private fb : FormBuilder,
      private userAction : UserActionService) {}

    userDetails = this.fb.group({
      userUserId : [],
      userFirstName : ['',Validators.required],
      userSurname: ['',Validators.required],
      userTelephone:[,Validators.required],
      userInitials: ['',Validators.required],
      userUserName:['',Validators.required],
      userPassword: ['',Validators.required],
      userColor:['',Validators.required],
      userTeamId:[],
      userRoleId:[],
      userJobTypeId:[,Validators.required],
      userIsDeleted: []
    });

    streettreatRoles: StreetTreatRole[] = [{
      roleId: 1 , roleName: 'Admin'
    },{
      roleId: 2 , roleName: 'Operator'
    }];

    ngOnInit() {
        this.dropdown.getAllTeams().subscribe(team=>{
          this.teamNames = team;
        });
        this.dropdown.getUserJobType().subscribe(jobType=>{
          this.jobTypes = jobType;
        });
    }

    Submit(userDetailsForm: any) {
      if(userDetailsForm.value.userJobTypeId)
     {
        console.log(userDetailsForm.value);
        this.userAction.insertUser(userDetailsForm.value);
     }
    }

    changed(){
      if(this.isChecked) {
        this.streetTreatdropdown = !this.streetTreatdropdown;
      }
    }

}
