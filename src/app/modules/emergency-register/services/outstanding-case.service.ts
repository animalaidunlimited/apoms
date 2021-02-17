import { Injectable, NgZone, ComponentFactoryResolver } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { ActionGroup, OutstandingAssignment, OutstandingCase, OutstandingCaseResponse, RescuerGroup, ActionPatient } from 'src/app/core/models/outstanding-case';
import { RescueDetailsService } from './rescue-details.service';
import { ThemePalette } from '@angular/material/core';
import { map } from 'rxjs/operators';
import { FilterKeys } from '../components/outstanding-case-board/outstanding-case-board.component';
import { Caller } from 'src/app/core/models/responses';
import { stringToKeyValue } from '@angular/flex-layout/extended/typings/style/style-transforms';

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
  ambulanceLocations$!:Observable<any>;

  haveReceivedFocus:BehaviorSubject<boolean> = new BehaviorSubject(Boolean(false));

  notificationPermissionGranted = false;

  refreshColour:BehaviorSubject<ThemePalette> = new BehaviorSubject('primary' as ThemePalette);

  initialRescueListSubscription:Subscription | undefined;

  initialised = false;

  actionStatus = [{actionStatus: 1 , actionStatusName: 'Received'},
  {actionStatus: 2 , actionStatusName: 'Assigned'},
  {actionStatus: 3 , actionStatusName: 'Arrived/Picked'},
  {actionStatus: 4 , actionStatusName: 'Rescued/Released'},
  {actionStatus: 5 , actionStatusName: 'Admitted'}];

  initialise(){

    if(this.initialised){
      return;
    }

      this.initialised = true;

      // Get the initial list from the rescue service
      this.initialRescueListSubscription = this.rescueService.getOutstandingRescues().subscribe((outstandingCases: OutstandingCaseResponse) => {
        if(outstandingCases){
          this.populateOutstandingCases(outstandingCases.outstandingActions);
        }
      });

      this.autoRefresh.subscribe(state => {
        this.autoRefreshState = state;
      });

  }

  refreshRescues(){
    this.initialRescueListSubscription = this.rescueService.getOutstandingRescues().subscribe((outstandingCases: any) => {
      if(outstandingCases)
      {
        this.populateOutstandingCases(outstandingCases.outstandingActions);
      }
    });
    return false;

  }

  populateOutstandingCases(outstandingCases:OutstandingCase[]){

    this.emitOutstandingCases(outstandingCases);

    this.zone.run(() => this.refreshColour.next('primary'));


    // Make sure we close the subscription as we only need to get this once when we initialise
    this.initialRescueListSubscription?.unsubscribe();

  }

  receiveUpdatedRescueMessage(updatedAssignment:OutstandingAssignment) {

    let currentOutstanding: OutstandingCase[];

    this.outstandingCases$.subscribe((cases: any) => {
      currentOutstanding = cases;

      currentOutstanding = this.removeRescueById(currentOutstanding, updatedAssignment);

      // Check to see if the swimlane exists and insert if not
    let laneExists = currentOutstanding.some(elem => elem.actionStatus === updatedAssignment.actionStatus);

    if(!laneExists && updatedAssignment.actionStatus){

      const rescueStatusName = ['Received',
      'Assigned',
      'Arrived/Picked',
      'Rescued/Released',
      'Admitted'];

      currentOutstanding.push({
        actionStatus: updatedAssignment.actionStatus,
        actionStatusName: rescueStatusName[updatedAssignment.actionStatus - 1],
        statusGroups: []
      });

      laneExists = true;
    }

    // Check to see if the rescuers exist and insert if not
    let rescuersExist = false;

    currentOutstanding.forEach(actionState => {

      if(actionState.actionStatus === updatedAssignment.actionStatus)
      {

        rescuersExist = actionState.statusGroups.some((actionGroup: RescuerGroup) =>
                                                              actionGroup.staff1 === updatedAssignment.staff1 &&
                                                              actionGroup.staff2 === updatedAssignment.staff2);

        if(!rescuersExist){

          const newRescueGroup:RescuerGroup = {
            staff1: updatedAssignment.staff1,
            staff1Abbreviation: updatedAssignment.staff1Abbreviation,
            staff2: updatedAssignment.staff2,
            staff2Abbreviation: updatedAssignment.staff2Abbreviation,
            latestLocation: undefined,
            actions : []
          };

          actionState.statusGroups.push(newRescueGroup);
          rescuersExist = true;

        }
      }

    });

    // Check to see if the action exists for the ambulance and insert if not
    let actionTypeExists = false;

    currentOutstanding.forEach(outstanding => {

      if(outstanding.actionStatus === updatedAssignment.actionStatus)
      {

        outstanding.statusGroups.forEach(rescuerGroup => {

          if(rescuerGroup.staff1 === updatedAssignment.staff1 && rescuerGroup.staff2 === updatedAssignment.staff2){

            actionTypeExists = rescuerGroup.actions.some(action => action.ambulanceAction === updatedAssignment.ambulanceAction);

            if(!actionTypeExists){

              const newAction = { ambulanceAction: updatedAssignment.ambulanceAction, ambulanceAssignment: []};

              rescuerGroup.actions.push(newAction);
              actionTypeExists = true;

            }
          }
        });

      }

  });

    // Insert the rescue into its new home
    if(rescuersExist && laneExists && actionTypeExists){
      this.insertRescue(currentOutstanding, updatedAssignment);
    }

    // Set the rescue to show as moved
    currentOutstanding = this.setMoved(currentOutstanding, updatedAssignment.emergencyCaseId, updatedAssignment.releaseId, true, false);

    }).unsubscribe();

    // Here we only do the refresh if the user has the toggle turned on.
    if(!this.autoRefreshState){
      this.zone.run(() => this.refreshColour.next('warn'));
      return;
    }

    // If the record is no longer outstanding, then removing it from the list is enough and we're finished here
    if(updatedAssignment.actionStatus){

      this.zone.run(() => this.refreshColour.next('primary'));

    }

    this.zone.run(() => this.emitOutstandingCases(currentOutstanding));


  }

  removeRescueById(outstanding:OutstandingCase[], rescue:OutstandingAssignment) {

    // Search through the outstanding cases and remove the old case

    outstanding.forEach(status => {

        status.statusGroups.forEach((state, stateIndex) => {

          state.actions.forEach((group, index) => {

            const removeIndex = group.ambulanceAssignment.findIndex(current => current.emergencyCaseId === rescue.emergencyCaseId &&
                                                                                current.releaseId === rescue.releaseId);

            if(removeIndex > -1){

               group.ambulanceAssignment.splice(removeIndex, 1);

                // If the group is now empty, remove it.
                if(group.ambulanceAssignment.length === 0){
                  state.actions.splice(index,1);

                  if(state.actions.length === 0){
                    status.statusGroups.splice(stateIndex, 1);
                  }
                }

                return;
            }

          });

          });

    });

    return outstanding.filter(cases => cases.statusGroups.length !== 0);
  }

  insertRescue(outstanding:OutstandingCase[], action:OutstandingAssignment){

    outstanding.forEach(status => {

      if(status.actionStatus === action.actionStatus){

        status.statusGroups.forEach(state => {

          state.actions.forEach(group => {

            if(state.staff1 === action.staff1 && state.staff2 === action.staff2 && group.ambulanceAction === action.ambulanceAction){
              group.ambulanceAssignment.push(action);

              group.ambulanceAssignment.sort((a,b) => b.emergencyNumber - a.emergencyNumber);
            }
          });
      });
      }

    });

    return outstanding;
  }

  setMoved(o:any, emergencyCaseId:number, releaseId: number, moved:boolean, timeout:boolean){


    // Search for the rescue and update its moved flag depending on whether this function
    // is being called by itself or not
      if( o?.emergencyCaseId === emergencyCaseId && o?.releaseId === releaseId){

        o.moved = moved;

        if(!timeout){
          setTimeout(() => {

            this.outstandingCases$.subscribe(cases => this.setMoved(cases, emergencyCaseId, releaseId, false, true));

          }

          , 3500);
        }

      }
      let result;
      let p;

      for (p in o) {
          if( o.hasOwnProperty(p) && typeof o[p] === 'object' ) {
              result = this.setMoved(o[p], emergencyCaseId, releaseId, moved, timeout);
          }
      }

      return o;

  }

  onSearchChange(filterKeysArray:FilterKeys[] ,searchValue: string): void {

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

          status.statusGroups.forEach(state => {

          state.actions.forEach(group => {

              group.ambulanceAssignment.forEach(assignment => {

                const assignment1 = JSON.parse(JSON.stringify(assignment));

                assignment.searchCandidate = false;
                assignment.filteredCandidate = true;

                let filterSuccess = 0;
                filterKeysArray.forEach((keyObject)=>{
                  const key = keyObject.group;
                  if(assignment1[key]===keyObject.value) {
                    filterSuccess++;
                  }
                  else if(key==='animalType') {
                    assignment.patients.forEach((patient:ActionPatient)=>{
                      if(patient[key]===keyObject.value) {
                        filterSuccess++;
                      }
                    });
                  }
                });

                assignment.filteredCandidate = filterSuccess === new Set(filterKeysArray.map(current=> current.group)).size;

                const currentValue = this.convertObjectToString(assignment);

                if(currentValue.toLowerCase().indexOf(searchValue) > -1 && searchValue !== '') {
                  assignment.searchCandidate = true;
                }
              });
            });
          });
        });
        this.emitOutstandingCases(outstanding);

    });

  }

  convertObjectToString(assignment : any){

    let result = '';
    if(assignment) {
      result = Object.entries(assignment).reduce((currentValue: string, val: any)=>{

        if(typeof val[1] === 'object') {
          currentValue += this.convertObjectToString(val[1]);
        }
        else if(typeof val[1] !== 'number' || val[0]==='emergencyNumber') {
          currentValue += currentValue + val[1] + '◬';
        }
        return currentValue;
      },'');
    }

    return result;

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

  emitOutstandingCases(outstandingCases:OutstandingCase[]){

    outstandingCases.sort((a,b) => a.actionStatus - b.actionStatus);

    outstandingCases.forEach(states =>
      {
        states.statusGroups.forEach(rescuerGroups => {

          rescuerGroups.actions.sort((a,b) => b.ambulanceAction > a.ambulanceAction ? 1 : -1);

          rescuerGroups.actions.forEach(action => action.ambulanceAssignment.sort((a,b) => b.emergencyNumber - a.emergencyNumber));

        });

      });

    this.zone.run(() => this.outstandingCases$.next(outstandingCases));

  }

  getAmbulanceLocations() :Observable<any>{

    return this.outstandingCases$.pipe(
      map((cases) => {
        if(cases.length !== 0){

          return cases.filter(swimlane => swimlane.actionStatus >= 3)
                      .map(states => states.statusGroups)

                        // In the below we need to aggregate the rescues into their own ambulance groups so that we can then find
                        // the last one based upon time. However if we make the changes directly to the result object of the
                        // reduce, it changes the underlying object, moving the rescues around to the wrong ambulance groups.
                        // So we need to create a new object based on the result (which is what the JSON.parse(JSON.stringify is doing)),
                        // to avoid changing the object that lives in the outstandingCases observable in the outstandingCases service.
                      .map(rescueReleaseGroups => JSON.parse(JSON.stringify(rescueReleaseGroups)))
                      .reduce((aggregatedLocations:RescuerGroup[], current:RescuerGroup[]) => {


                if(aggregatedLocations.length === 0){
                  return current;
                }
                else{

                  current.forEach((currentRescueGroup:RescuerGroup) => {

                    currentRescueGroup.actions.forEach((actionGroup:ActionGroup) => {

                    const index = aggregatedLocations.findIndex((parentRescueGroup:any) => {

                      return parentRescueGroup.staff1 === currentRescueGroup.staff1 &&
                          parentRescueGroup.staff2 === currentRescueGroup.staff2;

                    });

                    if(index > -1){

                      aggregatedLocations[index].actions.forEach((action:ActionGroup) => {

                        if(action.ambulanceAction === actionGroup.ambulanceAction){
                          action.ambulanceAssignment = action.ambulanceAssignment.concat(actionGroup.ambulanceAssignment);
                        }

                      });
                    }
                    else
                    {
                      aggregatedLocations.push(currentRescueGroup);
                    }


                    });
                  });

                  return aggregatedLocations;

                }},[])
              .map((actionGroups:RescuerGroup) => {

                let assignments:OutstandingAssignment[] = [];

                actionGroups.actions.forEach(action => {

                    assignments = assignments.length === 0 ? action.ambulanceAssignment : assignments.concat(action.ambulanceAssignment);

                });

                // TODO: Ask jim sir about it and confirm to him about this latest location for release.
                const maxAction = assignments.reduce((current:OutstandingAssignment, previous:OutstandingAssignment) => {

                  const currentTime = new Date(current.ambulanceArrivalTime) > (new Date(current.rescueTime) || new Date(1901, 1, 1))
                    ? current.ambulanceArrivalTime : current.rescueTime;

                  const previousTime = new Date(previous.ambulanceArrivalTime) > (new Date(previous.rescueTime) || new Date(1901, 1, 1))
                    ? previous.ambulanceArrivalTime : previous.rescueTime;

                  return previousTime > currentTime ? previous : current;

                });

               return {
                staff1: actionGroups.staff1,
                staff1Abbreviation: actionGroups.staff1Abbreviation,
                staff2: actionGroups.staff2,
                staff2Abbreviation: actionGroups.staff2Abbreviation,
                latestLocation: maxAction.latLngLiteral,
                actions: actionGroups
                };


             });

            }
        }

    ));


  }



}
