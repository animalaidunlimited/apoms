import { Component, OnInit, ViewChild } from '@angular/core';
import { UserDetails, UserDetailsForm, UserJobType } from 'src/app/core/models/user';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { UserDetailsService } from 'src/app/core/services/user-details/user-details.service';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { state, style, transition, animate, trigger } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { ModelFormGroup } from 'src/app/core/helpers/form-model';
import { Department } from 'src/app/core/models/rota';
import { MatOptionSelectionChange } from '@angular/material/core';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { UserPermissions } from 'src/app/core/models/permissions';
import { StreetTreatRole } from 'src/app/core/models/streettreat';
import { EvaluatePermissionService } from 'src/app/core/services/permissions/evaluate-permission.service';

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

  private ngUnsubscribe = new Subject();

    currentState = 'closed';

    dataSource: MatTableDataSource<UserDetails>;

    days = [
      {dayId: 0, name: "Monday"},
      {dayId: 1, name: "Tuesday"},
      {dayId: 2, name: "Wednesday"},
      {dayId: 3, name: "Thursday"},
      {dayId: 4, name: "Friday"},
      {dayId: 5, name: "Saturday"},
      {dayId: 6, name: "Sunday"}
    ];

    departments$: Observable<Department[]>;

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

    errorMatcher = new CrossFieldErrorMatcher();

    isChecked = true;

    jobTypes!: UserJobType[];

    hasWritePermission!: boolean;

    hide = true;

    loading = false;

    myCheck = false;

    permissionGroupObject!: UserPermissions[];

    streetTreatDropdown = false;

    streettreatRoles: StreetTreatRole[] = [{
      roleId: 1 , roleName: 'Admin'
    },{
      roleId: 2 , roleName: 'Operator'
    }];

    userDetails: ModelFormGroup<Omit<UserDetailsForm, 'role' | 'jobTitle' | 'isDeleted'>> = this.fb.nonNullable.group({
      userId : [0],
      employeeNumber : ['',Validators.required],
      firstName : ['',Validators.required],
      surname: ['',Validators.required],
      initials: [''],
      colour:[''],
      telephone:[0],
      userName:['',Validators.required],
      roleId:[0],
      jobTitleId:[0],
      password: [''],
      isStreetTreatUser:[false],
      permissionArray:[[0]],
      fixedDayOff: [[0]],
      departmentId: [0],
      localName: [''],
      excludeFromScheduleUsers: [false]
    });

    userList!: UserDetails[];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatTable) table!: MatTable<UserDetails>;

    constructor(private dropdown : DropdownService,
      private userOptionsService: UserOptionsService,
      private fb : UntypedFormBuilder,
      private userDetailsService : UserDetailsService,
      private snackBar: SnackbarService,
      private permissionService: EvaluatePermissionService,
      private route: ActivatedRoute) {

        this.departments$ = this.dropdown.getDepartments();

        this.dataSource = new MatTableDataSource([this.userDetails.value as UserDetails]);
      }



    ngOnInit() {

      this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val=> {

        if (val.componentPermissionLevel?.value === 2) {
            this.hasWritePermission = true;
        }

    });

      this.permissionGroupObject = this.permissionService.getPermissionsObject();

      this.dropdown.getUserJobType().pipe(takeUntil(this.ngUnsubscribe)).subscribe(jobType => {
        this.jobTypes = jobType;
      });

      this.getRefreshTableData();

    }

    getRefreshTableData() {

      this.userDetailsService.getUsersByIdRange(this.userOptionsService.getUserName()).then((userListData: UserDetails[])=>{

        this.userList = userListData;
        this.initialiseTable(this.userList);
      });

    }

    permissionChanges(permission: MatOptionSelectionChange) {

      const permissions = this.userDetails.get('permissionArray');

      if(permission.isUserInput && permission.source.selected) {
          const arrayVal = permissions?.value?.filter((val: number)=>
          val !== (permission.source.value + (permission.source.value % 2 === 0 ? -1 : 1))
        ) || [];
        permissions?.setValue(arrayVal,{emitEvent:false});
      }

    }


    initialiseTable(userTableData:UserDetails[]) {
      this.dataSource = new MatTableDataSource(userTableData);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }

    submit() {

      if(this.hasWritePermission) {
        this.loading = true;

        if(this.userDetails.valid) {
          this.userDetailsService.insertUser(this.userDetails.value).then((res : any)=>{
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
      this.snackBar.errorSnackBar('Error occurred!','Ok');
    }

    connectionError() {
      this.snackBar.errorSnackBar('Communication error, See admin.','Ok');
    }

    afterSaveActions() {
      this.refreshPage();
      this.streetTreatDropdown = false;
    }

    refreshPage() {
      this.getRefreshTableData();
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

    deleteUser() : void {

      let userId = this.userDetails.get('userId')?.value;

      if(!userId) return;

      this.userDetailsService.deleteUserById(userId).then(result => {

      if(result.success === 1){
        this.snackBar.successSnackBar('User deleted successfully.' , 'Ok');
        this.afterSaveActions();
        return;
      }

      this.snackBar.errorSnackBar('Delete error, See admin. error: UPC:465','Ok');               

      });
    }

}


