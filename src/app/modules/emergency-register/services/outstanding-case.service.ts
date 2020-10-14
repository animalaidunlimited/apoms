import { ChangeDetectorRef, Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { OutstandingRescue, OutstandingCase, RescuerGroup } from 'src/app/core/models/outstanding-case';
import { RescueDetailsService } from './rescue-details.service';
import { ThemePalette } from '@angular/material/core';

@Injectable({
  providedIn: 'root'
})
export class OutstandingCaseService {

  constructor(
    private rescueService: RescueDetailsService,
    private zone:NgZone
    ) { }
  autoRefresh:BehaviorSubject<boolean> = new BehaviorSubject(Boolean(false));
  autoRefreshState = false;

  outstandingCases$:BehaviorSubject<OutstandingCase[]> = new BehaviorSubject([] as OutstandingCase[]);
  ambulanceLocations$:BehaviorSubject<RescuerGroup[]> = new BehaviorSubject([] as RescuerGroup[]);

  haveReceivedFocus:BehaviorSubject<boolean> = new BehaviorSubject(Boolean(false));

  notificationPermissionGranted = false;

  refreshColour:BehaviorSubject<ThemePalette> = new BehaviorSubject('primary' as ThemePalette);

  initialRescueListSubscription:Subscription | undefined;

  initialised = false;

  initialise(){

    if(this.initialised){
      return;
    }

      this.initialised = true;

      // Get the initial list from the rescue service
      this.initialRescueListSubscription = this.rescueService.getOutstandingRescues().subscribe(outstandingCases => {
      this.populateOutstandingCases(outstandingCases.outstandingRescues);
      });

      this.autoRefresh.subscribe(state => {
        this.autoRefreshState = state;
      });

  }

  refreshRescues(){

    this.initialRescueListSubscription = this.rescueService.getOutstandingRescues().subscribe(outstandingCases => {
      this.populateOutstandingCases(outstandingCases.outstandingRescues);
      });

  }

  populateOutstandingCases(outstandingCases:OutstandingCase[]){

    this.zone.run(() => this.outstandingCases$.next(outstandingCases));

    this.zone.run(() => this.refreshColour.next('primary'));


    // Make sure we close the subscription as we only need to get this once when we initialise
    this.initialRescueListSubscription?.unsubscribe();

  }


  receiveUpdatedRescueMessage(updatedRescue:OutstandingRescue){

    let currentOutstanding: OutstandingCase[];

    this.outstandingCases$.subscribe(cases => {

      currentOutstanding = cases;
      currentOutstanding = this.removeRescueById(currentOutstanding, updatedRescue);

      // Check to see if the swimlane exists and insert if not
    const laneExists = currentOutstanding.find(elem => elem.rescueStatus === updatedRescue.rescueStatus);

    const newRescueGroup:RescuerGroup = {
      rescuer1: updatedRescue.rescuer1Id,
      rescuer1Abbreviation: updatedRescue.rescuer1Abbreviation,
      rescuer2: updatedRescue.rescuer2Id,
      rescuer2Abbreviation: updatedRescue.rescuer2Abbreviation,
      latestLocation: undefined,
      rescues: [updatedRescue],
    };

    if(!laneExists){

      const rescueStatusName = ['Received',
      'Assigned',
      'Arrived',
      'Rescued',
      'Admitted'];

      currentOutstanding.push({
        rescueStatus: updatedRescue.rescueStatus,
        rescueStatusName: rescueStatusName[updatedRescue.rescueStatus],
        rescuerGroups: [newRescueGroup]
      });
    }

    // Check to see if the rescuers exist and insert if not
    const rescuersExist = currentOutstanding.find(rescueState => {

      if(rescueState.rescueStatus === updatedRescue.rescueStatus)
      {
       return rescueState.rescuerGroups
      .find(rescueGroup =>  rescueGroup.rescuer1 === updatedRescue.rescuer1Id &&
                            rescueGroup.rescuer2 === updatedRescue.rescuer2Id);
      }

      return '';

    });

    if(!rescuersExist){

      currentOutstanding.forEach(rescueState => {

        if(rescueState.rescueStatus === updatedRescue.rescueStatus){
          rescueState.rescuerGroups.push(newRescueGroup);
        }
      });
    }

    // Insert the rescue into its new home
    if(rescuersExist && laneExists){
      this.insertRescue(currentOutstanding, updatedRescue);
    }

    // Set the rescue to show as moved
    currentOutstanding = this.setMoved(currentOutstanding, updatedRescue.emergencyCaseId, true, false);

    });

    // Here we only do the refresh if the user has the toggle turned on.
    if(!this.autoRefreshState){
      this.zone.run(() => this.refreshColour.next('warn'));
      return;
    }

    // If the record is no longer outstanding, then removing it from the list is enogu and we're finished here
    if(!updatedRescue.rescueStatus){
      this.zone.run(() => this.outstandingCases$.next(currentOutstanding));

      return;
    }



    this.zone.run(() => this.refreshColour.next('primary'));
    this.zone.run(() => this.outstandingCases$.next(currentOutstanding));


  }

  removeRescueById(outstanding:OutstandingCase[], rescue:OutstandingRescue) {

    // Search through the outstanding cases and remove the old case
    let returnCase:OutstandingRescue;

    outstanding.forEach(status => {

        status.rescuerGroups.forEach((group,index) => {

            const removeIndex = group.rescues
                              .findIndex(current => current.emergencyCaseId === rescue.emergencyCaseId);

            if(removeIndex > -1){

              returnCase = group.rescues.splice(removeIndex, 1)[0];

              // If the group is now empty, remove it.
              if(group.rescues.length === 0){
                status.rescuerGroups.splice(index,1);
              }
              return;
            }
          });
    });

    return outstanding;
  }

  insertRescue(outstanding:OutstandingCase[], rescue:OutstandingRescue){

    outstanding.forEach(status => {

      if(status.rescueStatus === rescue.rescueStatus){

        status.rescuerGroups.forEach(group => {

          if(group.rescuer1 === rescue.rescuer1Id && group.rescuer2 === rescue.rescuer2Id){

            group.rescues.push(rescue);
          }
        });
      }
    });

    return outstanding;
  }

  setMoved(o:any, emergencyCaseId:number, moved:boolean, timeout:boolean){

    // Search for the rescue and update its moved flag depending on whether this function
    // is being called by itself or not
      if( o?.emergencyCaseId === emergencyCaseId ){

        o.moved = moved;

        if(!timeout){
          setTimeout(() => this.setMoved(o, emergencyCaseId, false, true), 3500);
        }

      }
      let result;
      let p;

      for (p in o) {
          if( o.hasOwnProperty(p) && typeof o[p] === 'object' ) {
              result = this.setMoved(o[p], emergencyCaseId, moved, timeout);
          }
      }

      return o;

  }

  onSearchChange(searchValue: string): void {

    let haveRun = false;

    let outstanding:OutstandingCase[];

    this.outstandingCases$.subscribe(cases => {

      outstanding = cases;

      // We've already made a change, so no need to do anything further
      if(!outstanding || haveRun){
        return;
      }

      haveRun = true;

      outstanding.forEach(status =>
        {
          status.rescuerGroups.forEach(group => {

              group.rescues.forEach(rescue => {

                rescue.searchCandidate = false;

                // Because we can't use an observable as the source for the board, we need to add a
                // flag to the records that match our search.
                if(
                  Object.keys(rescue)
                  .reduce((currentTerm: string, key: string) => {
                    return currentTerm + (rescue as {[key: string]: any})[key] + '◬';
                  }, '').toLowerCase().indexOf(searchValue) > -1
                  && searchValue !== ''
                ){
                  rescue.searchCandidate = true;
                }
              });
            });
        });

         this.zone.run(() => {
          this.outstandingCases$.next(outstanding);
         });

    });



  }



  getAutoRefresh(){
    return this.autoRefresh;
  }

  setAutoRefresh(value:boolean){
    this.zone.run(() => this.autoRefresh.next(value));

  }

  toggleAutoRefresh(){

    let currentValue:boolean;

    this.autoRefresh.subscribe(value => {
      currentValue = value;
    });

    this.zone.run(() => this.autoRefresh.next(!currentValue));


  }

  // The window has received focus, so we may need to refresh
  receiveFocus(){
    this.zone.run(() => this.haveReceivedFocus.next(true));

  }



}
