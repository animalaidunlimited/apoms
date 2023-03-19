import { Component, OnInit, Input, forwardRef, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormControl, AbstractControl, UntypedFormBuilder, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { UserDetails } from 'src/app/core/models/user';
import { UserDetailsService } from 'src/app/core/services/user-details/user-details.service';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';

@Component({
  selector: 'app-user-autocomplete',
  templateUrl: './user-autocomplete.component.html',
  styleUrls: ['./user-autocomplete.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => UserAutocompleteComponent)
    }
  ]
})
export class UserAutocompleteComponent implements OnInit, ControlValueAccessor {

  @Input() existingUsersList: BehaviorSubject<number[]> | undefined;
  @Input() showLabel: boolean = false;
  @Input() formField: boolean = true;
  @Input() scheduleUsers: boolean = true;
  @Input() backgroundColour: string = "";
  @Output() selectionMade = new EventEmitter<boolean>();

  ngUnsubscribe = new Subject();

  disabled = false;

  errorMatcher = new CrossFieldErrorMatcher();

  filteredUsers!: Observable<UserDetails[]> | undefined;

  searchForm = this.fb.group({
    userId: new FormControl<string | number | null>(null)
  });  

  touched = false;

  userId : (number | string | null) = null;

  userList!: BehaviorSubject<UserDetails[]>;

  get currentUser() : AbstractControl<string | number | null, string | number | null> | null {
    return this.searchForm.get('userId');
  }

  constructor(
    private userDetails: UserDetailsService,
    private fb: UntypedFormBuilder
    ) { 

      this.userList = this.scheduleUsers ? this.userDetails.getScheduleUserList() : this.userDetails.getUserList();   
   }

  ngOnInit() {  

  }

  /* START VALUE ACCESSOR METHODS */
  onChange = (userId: number | string | null) => {};

  onTouched = () => {};

  writeValue(userId: number | string | null) {

    console.log(userId);

    this.userId = userId;
      
    this.searchForm.get('userId')?.setValue(userId);

  }

  registerOnChange(onChange: any) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  setDisabledState(disabled: boolean) {
    this.disabled = disabled;    
    
    disabled ? this.currentUser?.disable() : this.currentUser?.enable();
  }

  /* END VALUE ACCESSOR METHODS */

  setSelectedUsers() : void {

    this.selectionMade.emit(true);
    this.ngUnsubscribe.next();

    this.filteredUsers = this.currentUser?.valueChanges.pipe(
      takeUntil(this.ngUnsubscribe),
      startWith(''),
      map(value => this._filter(value)),
    );

  }

  get displayFn() {
    return (userId:number) => this.userDetails.getUserCode(userId);
  }

  private _filter(value: any): UserDetails[] {

    const searchValue = typeof(value) === "string" ? (value || "") : "";
    
    return this.userList?.value.filter(user => {

      //We may have a list of existing users that we need to exclude from the returned list
      if(this.existingUsersList){
        return (user.employeeNumber + ' - ' + user.firstName).toLowerCase().includes(searchValue.toLowerCase()) &&
        !this.existingUsersList?.value.some(existingUser => existingUser === user.userId)
      }
      else {
        return (user.employeeNumber + ' - ' + user.firstName).toLowerCase().includes(searchValue.toLowerCase());
      }

    });
  }

  userSelected(selectedUser: MatAutocompleteSelectedEvent) : void {
    this.onChange(selectedUser.option.value);
    this.selectionMade.emit(true);
  }

  checkUserSelectedAndClearIfRequired(){
    if(typeof(this.currentUser?.value) !== 'number'){
      this.currentUser?.reset();
    }
  }

}
