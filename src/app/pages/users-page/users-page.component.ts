import { Component, OnInit, ViewChild } from '@angular/core';
import { UserDetails, UserJobType } from 'src/app/core/models/user';
import { TeamDetails } from 'src/app/core/models/team';
import { FormBuilder, Validators } from '@angular/forms';
import { UserActionService } from 'src/app/core/services/user-details/user-action.service';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { state, style, transition, animate, trigger, group } from '@angular/animations';
import { MatOptionSelectionChange } from '@angular/material/core';


interface StreetTreatRole {
  roleId: number;
  roleName: string;
}

interface PermissionObject {
  groupId : number;
  groupValue: number;
}

interface UserPermissions {
  groupNameId: number;
  groupName: string;
  permissions: Permissions[];
}

interface Permissions {
  permissionId : number;
  permissionType: string
}


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
    loading = false;

    permissionByGroupArray: PermissionObject[] = [];

    permissionGroupObject!: UserPermissions[];

    teamNames!: TeamDetails[];

    userList!: UserDetails[];

    jobTypes!: UserJobType[];

    hide = true;

    streetTreatdropdown = false;

    isChecked = true;

    myCheck = false;
    currentState = 'closed';

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

    userDetails = this.fb.group({
      userId : [],
      firstName : ['',Validators.required],
      surName: ['',Validators.required],
      telephone:[],
      initials: [''],
      userName:['',Validators.required],
      password: [''],
      colour:[''],
      isStreetTreatUser:[],
      teamId:[],
      roleId:[],
      jobTitleId:[],
      permissionArray:[]
    });

    streettreatRoles: StreetTreatRole[] = [{
      roleId: 1 , roleName: 'Admin'
    },{
      roleId: 2 , roleName: 'Operator'
    }];

    ngOnInit() {

      this.permissionGroupObject = [
        {
          groupNameId:1,
          groupName: 'Emergency register',
          permissions: [{
            permissionId: 1,
            permissionType: 'Read'
          }, {
            permissionId : 2,
            permissionType: 'Write'
          }]
        },
        {
          groupNameId: 2,
          groupName: 'Hospital Manager',
          permissions: [{
            permissionId: 3,
            permissionType: 'Read'
          }, {
            permissionId : 4,
            permissionType: 'Write'
          }]
        },
        {
          groupNameId: 3,
          groupName: 'StreetTreat',
          permissions: [{
            permissionId: 5,
            permissionType: 'Read'
          }, {
            permissionId : 6,
            permissionType: 'Write'
          }]
        }
      ];

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

    permissionChanges(permission: MatOptionSelectionChange) {

      let permissions = this.userDetails.get('permission');

      if(permission.isUserInput && permission.source.selected) {
          let arrayval = permissions?.value?.filter((val: number)=> 
          val !== (permission.source.value + (permission.source.value % 2 === 0 ? -1 : 1))
        );
        permissions?.setValue(arrayval,{emitEvent:false});
      }

    }


    initialiseTable(userTableData:UserDetails[]) {
      this.dataSource = new MatTableDataSource(userTableData);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }

    Submit(userDetailsForm: any) {

      console.log(userDetailsForm.value);
      this.loading = true;

      if(userDetailsForm.get('password').value !== ''){
        userDetailsForm.get('password').setValue(userDetailsForm.get('password').value);
      }
      else {
        userDetailsForm.get('password').setValue('');
      }

      if(userDetailsForm.valid) {
        this.userAction.insertUser(userDetailsForm.value).then((res : any)=>{
          this.loading = false;

          if(res.success) {
            res.success === 1 ?

            this.insertSuccess() :

            res.success === -1 ?

              this.connectionError() :

              this.fail();
          }

          else if(res.updateSuccess) {
            res.updateSuccess === 1 ?

            this.updateSuccess() :

            res.updateSuccess === -1 ?

              this.connectionError() :

              this.fail();
          }
        });
      }
      else {
        this.loading = false;
        this.snackBar.errorSnackBar('Invalid input fields','Ok');
      }
    }

    insertSuccess () {
      this.snackBar.successSnackBar('User added successfully!' , 'Ok');
      this.afterSaveActions();
    }

    updateSuccess () {
      this.snackBar.successSnackBar('User updated successfully!' , 'Ok');
      this.afterSaveActions();
    }


    fail() {
      this.snackBar.errorSnackBar('Error occured!','Ok');
    }

    connectionError() {
      this.snackBar.errorSnackBar('Communication error, See admin.','Ok');
    }

    afterSaveActions() {
      this.refreshPage();
      this.streetTreatdropdown = false;
    }

    refreshPage() {
      this.getrefreshTableData();
      this.resetForm();
    }

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


