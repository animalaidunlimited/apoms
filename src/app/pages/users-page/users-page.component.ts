import {AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Team, UserJobType } from 'src/app/core/models/userDetails';
import { FormBuilder, Validators } from '@angular/forms';
import { UserActionService } from 'src/app/core/services/user-details/user-action.service';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import { EmptyError } from 'rxjs';
import { state, style, transition, animate, trigger } from '@angular/animations';


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
}


// const ELEMENT_DATA: Userdetails[] = [];

@Component({
    selector: 'app-users-page',
    templateUrl: './users-page.component.html',
    styleUrls: ['./users-page.component.scss'],
    animations: [
      trigger('openCloseDiv', [
        state('false', style({
          width: '0px',
          height: '0px',
          visibility: 'hidden'
        })),
        state('true',
         style({
          backgroundColor: '',
          width: '200px',
          height: '80px',
          visibility: 'visible'
        })),
        transition('true => false', [animate('250ms 750ms')]),
        transition('false => true', [animate('250ms')])
      ]),

      trigger('visibilityDiv', [
        state('false' , style({ opacity: 0 })),
        state('true', style({ opacity: 1})),
        transition('false <=> true', [animate('500ms 250ms')])
      ])
    
    ]
})
export class UsersPageComponent implements OnInit {
    teamNames!: Team[];

    userList!: UserDetails[];

    jobTypes!: UserJobType[];

    hide = true;

    streetTreatdropdown = false;

    isChecked = true;

    myCheck = false;
    currentState = 'closed';

    // 
    dataSource: MatTableDataSource<UserDetails> ;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatTable) table!: MatTable<UserDetails>;

    constructor(private dropdown : DropdownService,
      private fb : FormBuilder,
      private userAction : UserActionService,
      private snackBar: SnackbarService) {
        const emptyUser = {
          userId : 0,
          firstName: '',
          surName: '',
          initials: '',
          colour: '',
          telephone: 0,
          userName: '',
          teamId: 0,
          team: '',
          roleId: 0,
          role: '',
          jobTitleId: 0,
          jobTitle: ''
        };
        this.dataSource = new MatTableDataSource([emptyUser]);

      }

    displayedColumns: string[] = [
      'firstName',
      'surName',
      'initials',
      'telephone',
      'userName',
      'team',
      'role',
      'jobTitle'
    ];

    // userDetailRecords = new MatTableDataSource(ELEMENT_DATA);
    // new MatTableDataSource(this.userDetailRecords);

    userDetails = this.fb.group({
      userId : [], 
      firstName : ['',Validators.required],
      surName: ['',Validators.required],
      telephone:[,Validators.required],
      initials: ['',Validators.required],
      userName:['',Validators.required],
      password: ['',Validators.required],
      colour:[''],
      isStreetTreatUser:[],
      teamId:[],
      roleId:[],
      jobTitleId:[,Validators.required]
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
      this.userAction.getUsersByIdRange().then((userListData: UserDetails[])=>{
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

    resetForm() {
      this.userDetails.reset();
      this.streetTreatdropdown = false;
    }

    
    changed(){
      if(this.isChecked) {
       
        // this.currentState = this.currentState === 'closed' ? 'open' : 'closed';
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

    selectRow(selectedUser:any)
    {
      if(typeof(selectedUser.jobTitleId)==='string'){
        let jobTypeId = [];
        jobTypeId = selectedUser.jobTitleId!==null?selectedUser.jobTitleId.split(',').map(Number):null;
        selectedUser.jobTitleId = jobTypeId;
      }

      const isAStreetTreatUser = selectedUser.teamId!== null? true:false;

      this.userDetails.patchValue(selectedUser);

      this.userDetails.get('isStreetTreatUser')?.setValue(isAStreetTreatUser);
    
      const streetTreatUser = this.userDetails.get('isStreetTreatUser')?.value;

      this.streetTreatdropdown = streetTreatUser ? true : false;
      this.currentState = 'closed' ? 'open' : 'closed'; 
      
    }

}


