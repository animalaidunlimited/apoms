import { Component, OnInit } from '@angular/core';
import { UserDetailsService } from 'src/app/core/services/user-details/user-details.service';
import { Team, UserJobType } from 'src/app/core/models/userDetails';
import { FormBuilder, Validators } from '@angular/forms';
import { UserActionService } from 'src/app/core/services/user-details/user-action.service';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';

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
      private userAction : UserActionService,
      private snackBar: SnackbarService) {}

    userDetails = this.fb.group({
      userUserId : 133, 
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
      console.log(userDetailsForm.value);
        this.userAction.insertUser(userDetailsForm.value).then((res : any)=>{
          if(res[0].vSuccess===1){
            
            this.snackBar.successSnackBar('User added successfully!' , 'Ok');
            userDetailsForm.reset();

          }
          else {

            this.snackBar.errorSnackBar('Error occured!','Ok');

          }

        });

    }

    changed(){
      if(this.isChecked) {
        this.streetTreatdropdown = !this.streetTreatdropdown;
      }
    }

}
