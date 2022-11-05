import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserAccountDetails, UserPreferences } from 'src/app/core/models/user';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { UserNotificationService } from 'src/app/core/services/user-notification/user-notification.service';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';

@Component({
  selector: 'app-user-preferences',
  templateUrl: './user-preferences.component.html',
  styleUrls: ['./user-preferences.component.scss']
})
export class UserPreferencesComponent implements OnInit {

  notificationCount: BehaviorSubject<number>;


  showPreferences = false;

  userDetails!: BehaviorSubject<UserAccountDetails>;

  userDetailsForm = this.fb.group({
      clearSearchOnTabReturn: false
  });


  @ViewChild('preferencesDiv') preferencesDiv!: ElementRef;

  constructor(private fb: FormBuilder,
    private snackbar: SnackbarService,
    private userService: UserOptionsService,
    private notificationService: UserNotificationService,
    private renderer: Renderer2) {

      this.notificationCount = this.notificationService.notificationCount();

     }

  ngOnInit() {

    this.userDetails = this.userService.getUserAccountDetails();

    this.userDetails.subscribe(preferences => {
        this.userDetailsForm.patchValue(preferences.preferences, {emitEvent: false});
    });

    this.userDetailsForm.valueChanges.subscribe(preferences => {

        this.saveUserPreferences(preferences);
    });

    this.renderer.listen('window', 'click',(e:Event)=>{

        // Close the preferences div if clicking outside of it
        if(!this.preferencesDiv.nativeElement.contains(e.target) && this.showPreferences) {
          this.showPreferences = false;
        }

    });

  }

  saveUserPreferences(preferences : UserPreferences) : void {

    this.userService.updateUserPreferences(preferences).then(result => {

        result.success === 1 ?
            this.snackbar.successSnackBar('User preferences updated successfully', 'OK')
             :
            this.snackbar.errorSnackBar('Error updating user preferences', 'OK');

    })

}

notificationClicked(clicked: boolean) : void {

  if(clicked) {
    this.showPreferences = false;
  }
}

}
