import { Component, OnInit, ViewChild } from '@angular/core';
import { UserDetails, UserJobType } from 'src/app/core/models/user';
import { FormBuilder, Validators } from '@angular/forms';
import { UserDetailsService } from 'src/app/core/services/user-details/user-details.service';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { state, style, transition, animate, trigger } from '@angular/animations';
import { MatOptionSelectionChange } from '@angular/material/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';


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
  permissionType: string;
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
          height: '100%',
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

    userList!: UserDetails[];

    jobTypes!: UserJobType[];

    hide = true;

    streetTreatDropdown = false;

    isChecked = true;

    myCheck = false;
    currentState = 'closed';

    hasWritePermission!: boolean;

    private ngUnsubscribe = new Subject();


    dataSource: MatTableDataSource<UserDetails> ;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatTable) table!: MatTable<UserDetails>;

    constructor(private dropdown : DropdownService,
      private userOptionsService: UserOptionsService,
      private fb : FormBuilder,
      private userDetailsService : UserDetailsService,
      private snackBar: SnackbarService,
      private route: ActivatedRoute) {
        const emptyUser = {
          userId : 0,
          employeeNumber: '',
          firstName: '',
          surname: '',
          initials: '',
          colour: '',
          telephone: 0,
          userName: '',
          roleId: 0,
          role: '',
          jobTitleId: 0,
          jobTitle: ''
        };
        this.dataSource = new MatTableDataSource([emptyUser]);
      }

    displayedColumns: string[] = [
      'employeeNumber',
      'firstName',
      'surname',
      'initials',
      'telephone',
      'userName',
      'role',
      'jobTitle'
    ];

    userDetails = this.fb.group({
      userId : [],
      employeeNumber : ['',Validators.required],
      firstName : ['',Validators.required],
      surname: ['',Validators.required],
      telephone:[],
      initials: [''],
      userName:['',Validators.required],
      password: [''],
      colour:[''],
      isStreetTreatUser:[],
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

      this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val=> {

        if (val.componentPermissionLevel?.value === 2) {
            this.hasWritePermission = true;
        }

    });

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
          groupName: 'Hospital manager',
          permissions: [{
            permissionId: 3,
            permissionType: 'Read'
          }, {
            permissionId : 4,
            permissionType: 'Write'
          }]
        }
        ,{
          groupNameId: 3,
          groupName: 'Treatment list',
          permissions: [{
            permissionId: 7,
            permissionType: 'Read'
          }, {
            permissionId : 8,
            permissionType: 'Write'
          }]
        },
        {
          groupNameId: 4,
          groupName: 'StreetTreat',
          permissions: [{
            permissionId: 5,
            permissionType: 'Read'
          }, {
            permissionId : 6,
            permissionType: 'Write'
          }]
        },
        {
          groupNameId: 5,
          groupName: 'Vehicles',
          permissions: [{
            permissionId: 15,
            permissionType: 'Read'
          }, {
            permissionId : 16,
            permissionType: 'Write'
          }]
        },
        {
          groupNameId: 6,
          groupName: 'Driver view',
          permissions: [{
            permissionId: 13,
            permissionType: 'Read'
          }, {
            permissionId : 14,
            permissionType: 'Write'
          }]
        },
        {
          groupNameId: 7,
          groupName: 'Staff Rota',
          permissions: [{
            permissionId: 17,
            permissionType: 'Read'
          }, {
            permissionId : 18,
            permissionType: 'Write'
          }]
        },
        {
          groupNameId: 8,
          groupName: 'Reporting',
          permissions: [{
            permissionId: 9,
            permissionType: 'Read'
          }, {
            permissionId : 10,
            permissionType: 'Write'
          }]
        },
        {
          groupNameId: 9,
          groupName: 'Settings',
          permissions: [{
            permissionId: 11,
            permissionType: 'Read'
          }, {
            permissionId : 12,
            permissionType: 'Write'
          }]
        }


      ];

      this.dropdown.getUserJobType().pipe(takeUntil(this.ngUnsubscribe)).subscribe(jobType=>{
        this.jobTypes = jobType;
      });
      this.getrefreshTableData();

    }

    getrefreshTableData() {

      this.userDetailsService.getUsersByIdRange(this.userOptionsService.getUserName()).then((userListData: UserDetails[])=>{
        this.userList = userListData;
        this.initialiseTable(this.userList);
      });

    }

    permissionChanges(permission: MatOptionSelectionChange) {

      const permissions = this.userDetails.get('permissionArray');

      if(permission.isUserInput && permission.source.selected) {
          const arrayval = permissions?.value?.filter((val: number)=>
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

    submit(userDetailsForm: any) {

      if(this.hasWritePermission) {
        this.loading = true;

        if(userDetailsForm.get('password').value !== ''){
          userDetailsForm.get('password').setValue(userDetailsForm.get('password').value);
        }
        else {
          userDetailsForm.get('password').setValue('');
        }

        if(userDetailsForm.valid) {
          this.userDetailsService.insertUser(userDetailsForm.value).then((res : any)=>{
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

      else {
        this.snackBar.errorSnackBar('You do not have permission to save; please see the admin','Ok');
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
      this.streetTreatDropdown = false;
    }

    refreshPage() {
      this.getrefreshTableData();
      this.resetForm();
    }

    resetForm() {
      this.userDetails.reset();
      this.streetTreatDropdown = false;
    }


    changed(){
      if(this.isChecked) {
        this.streetTreatDropdown = !this.streetTreatDropdown;
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
      if(typeof(selectedUser.jobTitleId) === 'string'){
        let jobTypeId = [];
        jobTypeId = selectedUser.jobTitleId!==null?selectedUser.jobTitleId.split(',').map(Number):null;
        selectedUser.jobTitleId = jobTypeId;
      }

      this.userDetails.patchValue(selectedUser);

    }

}


