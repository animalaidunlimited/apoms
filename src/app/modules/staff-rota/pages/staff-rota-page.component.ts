import { Component, OnInit } from '@angular/core';
import { generateUUID } from 'src/app/core/helpers/utils';
import { UserDetails } from 'src/app/core/models/user';
import { UserDetailsService } from 'src/app/core/services/user-details/user-details.service';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { BehaviorSubject } from 'rxjs';
import { FormGroup, FormBuilder, FormArray, AbstractControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';



interface StaffTask{
  coords: string;
  id: string;
  assignedUserId: number;
  employeeNumber: string;
  firstName: string;
}

interface RotationPeriod{
  id: string;
  sequence: number;
  startDate: Date | string;
  endDate: Date | string;
}

interface AreaShift{
  id: string;
  sequence: number;
  name: string;
  startTime: string;
  endTime: string;
  }

interface Role{
  roleId: number;
  role: string;
}


@Component({
  selector: 'app-staff-rota',
  templateUrl: './staff-rota-page.component.html',
  styleUrls: ['./staff-rota-page.component.scss']
})

export class StaffRotaPageComponent implements OnInit {

  groups: AreaShift[] = [];
  matrix: StaffTask[] = [];

  rotationPeriods: RotationPeriod[] = [];

  jobRoles$ = new BehaviorSubject<Role[]>([{roleId: 1, role: 'N01'}, {roleId: 2, role: 'N02'}, {roleId: 3, role: 'N03'}]);
  selectedJobRoles : string[] = [];

  rotaForm:FormGroup;

  userList!: UserDetails[];

  periodArrayForm: AbstractControl[];

  constructor(
    private userDetailsService: UserDetailsService,
    private userOptionsService: UserOptionsService,
    private fb: FormBuilder
    ) {

      this.rotaForm = this.fb.group({
        periodArray: this.fb.array([]),
        groupArray: this.fb.array([])
      });

      let blankPeriod = this.fb.group({id: generateUUID(),
        sequence: (this.groups?.length || -1) + 1,
        name: "",
        startDate: "",
        endDate: ""});

        let periodArray = this.rotaForm.get("periodArray") as FormArray;
        periodArray.push(blankPeriod);

        this.periodArrayForm = periodArray.controls;

  }



  ngOnInit(): void {


    //Set up some defaults so we're not empty
    this.addAreaShift();
    this.addRotationPeriod();

    //Go and get the user list so we can populate the drag list
    this.userDetailsService.getUsersByIdRange(this.userOptionsService.getUserName()).then((userListData: UserDetails[])=>{
      this.userList = userListData;
    });

  }

  addAreaShift(){

    this.groups.push(this.generateEmptyAreaShift());

  }

  private generateEmptyAreaShift() : AreaShift {

    const defaultAreaShift =  {
                                    id: generateUUID(),
                                    sequence: (this.groups?.length || -1) + 1,
                                    name: "",
                                    startTime: "",
                                    endTime: ""
                                  };

    return defaultAreaShift;
  }

  addRotationPeriod(){

    this.rotationPeriods.push(this.generateDefaultRotationPeriod());

  }

  private generateDefaultRotationPeriod() : RotationPeriod {

    const maxSequence = this.rotationPeriods.length === 0 ? 0 : this.rotationPeriods.reduce((a,b) => a.sequence < b.sequence ? b : a).sequence + 1

    const defaultRotationPeriod : RotationPeriod = {
                                                    id: generateUUID(),
                                                    sequence: maxSequence,
                                                    startDate: "",
                                                    endDate: ""
                                                  }

    return defaultRotationPeriod;

  }

  entered(){
    console.log('entered');
  }

  drop(event: CdkDragDrop<any>, periodId: string, groupId: string){

    console.log('drop');

    const user = this.userList[event.previousIndex];

    const addedTask:StaffTask = {
      coords: groupId.concat(periodId),
      id: generateUUID(),
      assignedUserId: user.userId,
      employeeNumber: user.employeeNumber,
      firstName: user.firstName
    }

    let foundIndex = this.matrix.findIndex(element => element.coords == this.getCoords(groupId, periodId));

    // If the area shift already exists, then replace it with the updated one, otherwise add it into the array.
    this.matrix.splice(foundIndex, foundIndex > -1 ? 1 : 0, addedTask)


  }

  getGroupPeriodAssignedStaff(groupId: string, periodId: string) {

    const foundIndex = this.matrix.findIndex(element => element.coords == this.getCoords(groupId, periodId));

    return foundIndex > -1 ? this.matrix[foundIndex].employeeNumber + " - " + this.matrix[foundIndex].firstName : "";

  }

  getCoords(groupId: string, periodId: string): string {
    return groupId.concat(periodId)
  }

  groupSelected($event: MatSelectChange) : void {

    console.log($event);

    this.selectedJobRoles.push($event.value as string);

  }



}
