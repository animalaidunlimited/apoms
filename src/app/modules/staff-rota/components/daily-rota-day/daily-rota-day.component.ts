import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormArray, AbstractControl, FormBuilder } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, skip, startWith, take } from 'rxjs/operators';
import { UserDetails } from 'src/app/core/models/user';
import { DailyRotaService } from './../../services/daily-rota.service';

@Component({
  selector: 'app-daily-rota-day',
  templateUrl: './daily-rota-day.component.html',
  styleUrls: ['./daily-rota-day.component.scss']
})
export class DailyRotaDayComponent implements OnInit {

  @Input() inputRotaDayAssignments!: unknown;

  dataSource: BehaviorSubject<AbstractControl[]> = new BehaviorSubject<AbstractControl[]>([this.fb.group({})]);

  rotaDayForm = this.fb.group({    
    rotaDayAssignments: this.fb.array([])
  });

  displayedColumns = ["rotationArea", "rotationRole", "userId", "plannedStartTime", "plannedEndTime", "actualStartTime", "actualEndTime", "notes"];

  filteredUsers!: Observable<UserDetails[]> | undefined;

  rotaDayAssignments!: AbstractControl[];  

  userList!: BehaviorSubject<UserDetails[]>;

  public get getAssignments() : FormArray {
    return this.rotaDayForm.get('rotaDayAssignments') as FormArray;
  }

  constructor(
    private dailyRotaService: DailyRotaService,    
    private fb: FormBuilder
  ) {     

  }

  ngOnInit() {

    this.userList = this.dailyRotaService.getUserList();

    this.userList.pipe(skip(1), take(1)).subscribe(() => this.initialiseForm());

  }

  private initialiseForm() {
    this.rotaDayAssignments = (this.inputRotaDayAssignments as FormArray)?.controls;

    this.dataSource.next(this.rotaDayAssignments);

    this.rotaDayForm?.setControl('rotaDayAssignments', <FormArray>this.inputRotaDayAssignments);
  }

  ngOnChanges(changes: SimpleChanges) : void {    

    // this.rotaDayForm?.setControl('rotaDayAssignments', <FormArray>this.inputRotaDayAssignments);

    this.initialiseForm();

  }

  setFilteredUsers(control: AbstractControl | null | undefined): void {

    if(!control){
      return;
    };

    this.filteredUsers = control?.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value)),
    );

  }

  private _filter(value: string | undefined): UserDetails[] {

    const searchValue = typeof(value) === "string" ? (value || "") : "";

    const existingUsers: number[] = this.currentUserList();
    
    return this.userList?.value.filter(user => {
     
      return (user.employeeNumber + ' - ' + user.firstName).toLowerCase().includes(searchValue.toLowerCase()) &&
      !existingUsers.some(existingUserId => existingUserId === user.userId);
    
    });
  }

  private currentUserList() : number[] {

    return this.rotaDayAssignments.map(element => Number(element.get('userId')?.value || element.get('rotationUserId')?.value))

  }

  get displayFn() {
    return (userId:number) => this.findUser(userId);
 }

 findUser(userId: number) : string {

  let foundUser = this.userList.value.find(user => user.userId === userId);

  return foundUser ? `${foundUser.employeeNumber} - ${foundUser.firstName}` : '';


 }

}
