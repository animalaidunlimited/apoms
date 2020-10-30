import {AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Team, UserJobType } from 'src/app/core/models/userDetails';
import { FormBuilder, Validators } from '@angular/forms';
import { UserActionService } from 'src/app/core/services/user-details/user-action.service';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';


interface StreetTreatRole {
  roleId: number;
  roleName: string;
}

export interface UserDetails {
  userId : number;
  firstName: string;
  surName: string;
  initials: string;
  colour: string;
  telephone: number;
  userName: string;
  teamId: number;
  team: string;
  roleId: number;
  role: string;
  jobTitleId: number;
  jobTitle: string;
  isDeleted: boolean;

}


// const ELEMENT_DATA: Userdetails[] = [];

@Component({
    selector: 'app-users-page',
    templateUrl: './users-page.component.html',
    styleUrls: ['./users-page.component.scss'],
})
export class UsersPageComponent implements OnInit {
    teamNames!: Team[];

    userList!: UserDetails[];

    jobTypes!: UserJobType[];

    hide = true;

    streetTreatdropdown = false;

    isChecked = true;

    // 
    dataSource!: MatTableDataSource<UserDetails>;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatTable) table!: MatTable<UserDetails>;

    constructor(private dropdown : DropdownService,
      private fb : FormBuilder,
      private userAction : UserActionService,
      private snackBar: SnackbarService) {}

    displayedColumns: string[] = [
      'First Name',
      'Surname',
      'Initials',
      'Telephone',
      'Username',
      'Team',
      'StreetTreat Role',
      'Job Title',
      'Is Deleted'
    ];

    // userDetailRecords = new MatTableDataSource(ELEMENT_DATA);
    // new MatTableDataSource(this.userDetailRecords);

    userDetails = this.fb.group({
      userUserId : [], 
      userFirstName : ['',Validators.required],
      userSurname: ['',Validators.required],
      userTelephone:[,Validators.required],
      userInitials: ['',Validators.required],
      userUserName:['',Validators.required],
      userPassword: ['',Validators.required],
      userColor:[''],
      isStreetTreatUser:[],
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

        this.getrefreshTableData();
        
    }

    getrefreshTableData() {
      this.userAction.getUsersByIdRange().subscribe((userListData: UserDetails[])=>{
        this.userList = userListData;
        this.initialiseTable(this.userList);
      });
    }

    initialiseTable(userTableData:UserDetails[]) {
      this.dataSource = new MatTableDataSource(userTableData);
      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort; 
      });
      
     
    }   

    Submit(userDetailsForm: any) {
      if(userDetailsForm.valid){
        this.userAction.insertUser(userDetailsForm.value).then((res : any)=>{
          if(res.vUpdateSuccess) {
            // this.updateUserTable(userDetailsForm.value);
            this.snackBar.successSnackBar('User updated successfully!' , 'Ok');
            this.refreshTable();
            this.resetForm();
            this.streetTreatdropdown = false;
          }
          else if(res.vSuccess) {
            // this.insertIntoTable(userDetailsForm.value);
            this.snackBar.successSnackBar('User added successfully!' , 'Ok');
            this.refreshTable();
            this.resetForm();
             this.streetTreatdropdown = false;
          }
          else {
            this.snackBar.errorSnackBar('Error occured!','Ok');
          }

        });
      }
      else {
        this.snackBar.errorSnackBar('Invalid input fields','Ok');
      }

    }

    refreshTable() {
      this.getrefreshTableData();
    }

    // updateUserTable(userDetailsValue: any) {
    //   const index = this.userList.findIndex(user=> user.userId === userDetailsValue.userUserId);
    //   const team = this.userList[index].team;
    //   const role = this.userList[index].role;
    //   const jobTitle = this.userList[index].jobTitle;
    //   const userDetailsdata: UserDetails = {
    //     userId: userDetailsValue.userUserId,
    //     firstName: userDetailsValue.userFirstName,
    //     surName: userDetailsValue.userSurname,
    //     initials: userDetailsValue.userInitials,
    //     colour: userDetailsValue.userColor,
    //     telephone: userDetailsValue.userTelephone,
    //     userName: userDetailsValue.userUserName,
    //     teamId: userDetailsValue.userTeamId,
    //     team,
    //     roleId: userDetailsValue.userRoleId,
    //     role,
    //     jobTitleId: userDetailsValue.userJobTypeId,
    //     jobTitle,
    //     isDeleted: userDetailsValue.userIsDeleted
              
    //   };
    //   this.userList.splice(index, 1, userDetailsdata);
    //   this.initialiseTable(this.userList);
    // }

    // insertIntoTable(userDetailsValue: any) {
    //   this.userList.push(userDetailsValue);
    //   this.initialiseTable(this.userList);
    //   this.table.renderRows();
    // }


    resetForm() {
      this.userDetails.reset();
      this.streetTreatdropdown = false;
    }

    changed(){
      if(this.isChecked) {
        this.streetTreatdropdown = !this.streetTreatdropdown;
      }
    }

    applyFilter(event: Event) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.dataSource.filter = filterValue.trim().toLowerCase();

      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }

    selectRow(selectedUser: any)
    {
      let jobTypeId = [];
      jobTypeId = selectedUser.jobTitleId!==null?selectedUser.jobTitleId.split(',').map(Number):null;
      this.userDetails.patchValue({
        userUserId: selectedUser.userId,
        userFirstName: selectedUser.firstName,
        userSurname: selectedUser.surName,
        userTelephone:selectedUser.telephone,
        userInitials: selectedUser.initials,
        userUserName: selectedUser.userName,
        userPassword: selectedUser.password,
        userColor: selectedUser.colour,
        isStreetTreatUser:selectedUser.teamId!==null?true:false,
        userTeamId:selectedUser.teamId,
        userRoleId: selectedUser.roleId,
        userJobTypeId: jobTypeId,
        userIsDeleted: selectedUser.isDeleted==='No'?false:true
      });
  
      const streetTreatUser = this.userDetails.get('isStreetTreatUser')?.value;
      if(streetTreatUser) {
        this.streetTreatdropdown = true;
      }
      else {
        this.streetTreatdropdown = false;
      }
      
    }

}
