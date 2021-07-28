
import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatChip, MatChipList } from '@angular/material/chips';
import { ThemePalette } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, skip, startWith, take, takeUntil } from 'rxjs/operators';
import { MediaDialogComponent } from 'src/app/core/components/media/media-dialog/media-dialog.component';
import { RescueDetailsDialogComponent } from 'src/app/core/components/rescue-details-dialog/rescue-details-dialog.component';
import { AnimalType } from 'src/app/core/models/animal-type';
import { EmergencyCode } from 'src/app/core/models/emergency-record';
import { ActiveVehicleLocation } from 'src/app/core/models/location';
import { OutstandingAssignment2 } from 'src/app/core/models/outstanding-case';
import { SearchResponse } from 'src/app/core/models/responses';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { LocationService } from 'src/app/core/services/location/location.service';
import { MessagingService } from '../../services/messaging.service';
import { OutstandingCaseService } from '../../services/outstanding-case.service';
import { OutstandingCase2Service } from '../../services/outstanding-case2.service';
import { FilterKeys } from '../outstanding-case-board/outstanding-case-board.component';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'outstanding-case-board2',
  templateUrl: './outstanding-case-board2.component.html',
  styleUrls: ['./outstanding-case-board2.component.scss']
})
export class OutstandingCaseBoard2Component implements OnInit,OnDestroy {

  vehicleId$!: Observable<(number | null)[]>;


  ambulanceLocations$!:Observable<ActiveVehicleLocation[]>;

  outstandingCases$!:  Observable<OutstandingAssignment2[]>;
  receivedVehicleList$!:  Observable<OutstandingAssignment2[]>;

  searchForm:FormGroup = new FormGroup({});
  searchValue!: string;

  ngUnsubscribe = new Subject();

  filterKeysArray : FilterKeys[] = [];
  
  showAmbulancePaths = false;
  autoRefresh = false;
  loaded = false;
  hideList = true;
  hideMap = true;
  loading = new BehaviorSubject<boolean>(true);
  notificationPermissionGranted = false;
  removable = true;

  refreshColour:ThemePalette = 'primary';
  filterBtnColor: ThemePalette = 'accent';

  refreshColour$!:BehaviorSubject<ThemePalette>;
  incomingObject!: FilterKeys;


  caseFilter = [{
    groupId: 1,
    showTitle: 'Ambulance action',
    groupTitle: 'ambulanceAction',
    groupValues: [{
      id: 1 , value: 'Rescue'
    },
    {
      id: 2 , value: 'Release'
    }]
  },
  {
    groupId: 2,
    groupTitle: 'emergencyCode',
    showTitle: 'Emergency code',
    groupValues: []
  },
  {
    groupId: 3,
    showTitle: 'Animal type',
    groupTitle: 'animalType',
    groupValues: []
  }];
  
  
  @Output() public openEmergencyCase = new EventEmitter<SearchResponse>();

  @ViewChildren('filterChips') filterChips!: MatChipList[];

  matChipObs = new BehaviorSubject(null);

  constructor( 
    private outstandingCase2Service: OutstandingCase2Service,
    public rescueDialog: MatDialog,
    private dialog: MatDialog,
    private locationService: LocationService,
    private fb: FormBuilder,
    private messagingService: MessagingService,
    private outstandingCaseService: OutstandingCaseService,
    private changeDetector: ChangeDetectorRef,
    private dropDown: DropdownService) { }

  ngOnInit(): void {


    this.receivedVehicleList$ = this.outstandingCase2Service.filterCases(
      this.matChipObs,
      this.outstandingCase2Service.getOutstandingCasesByVehicleId(null).pipe(
        /** to fire complete on observable 
         * so finalize operator can be init
         */
        take(2),
        finalize(() => {
        this.loading.next(false);
        this.loaded = true;        }
        ),
        catchError(error => {
          this.loading.next(false);
          return throwError(error);
        })
      ),
      this.filterKeysArray,
      this.ngUnsubscribe
      );

    
    this.vehicleId$ = this.outstandingCase2Service.getVehicleId().pipe(skip(1)); 


    this.searchForm = this.fb.group({
      searchTerm: ['']
    });


    this.outstandingCase2Service.onSearchChange(this.searchForm.get('searchTerm')?.valueChanges
    .pipe(
      distinctUntilChanged(),
      debounceTime(250),
      startWith(''),
      takeUntil(this.ngUnsubscribe)
      ) as Observable<string>,
      this.receivedVehicleList$,
      this.ngUnsubscribe
      ).subscribe(val => console.log(val));
    
 


    this.ambulanceLocations$ = this.locationService.ambulanceLocations$;

    this.refreshColour$ = this.outstandingCaseService.refreshColour;

    this.refreshColour$
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(colour => {
      this.refreshColour = colour;
      this.changeDetector.detectChanges();
    });

    this.dropDown.getAnimalTypes()
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe((animalType: AnimalType[])=> {

      animalType.forEach(type=> {

        this.caseFilter.forEach(filterObject=>{

          if(filterObject.groupId === 3) {

            filterObject.groupValues.push({
              id: type.AnimalTypeId,
              value: type.AnimalType
            });

          }

        });

      });

    });


    this.dropDown.getEmergencyCodes()
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe((emergencyCodes: EmergencyCode[])=> {
      emergencyCodes.forEach(emcode=>{

        this.caseFilter.forEach(filterObject=>{

          if(filterObject.groupId === 2) {

            filterObject.groupValues.push({
              id: emcode.EmergencyCodeId,
              value: emcode.EmergencyCode
            });

          }

        });

      });
    });

    this.setup();

  }

  setup(){

    this.messagingService.getPermissionGranted()
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe((permissionGranted) => {

      this.notificationPermissionGranted = !!permissionGranted;

      this.outstandingCaseService.getAutoRefresh()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(value => {

        this.autoRefresh = value;

      });

      this.outstandingCaseService.setAutoRefresh(!!permissionGranted);
      this.changeDetector.detectChanges();

    });

  }

  refreshRescues(){

    this.loading.next(true);

    this.outstandingCaseService.refreshRescues();

  }

  openRescueEdit(outstandingCase:OutstandingAssignment2){
    const rescueDialog = this.rescueDialog.open(RescueDetailsDialogComponent, {
        maxWidth: 'auto',
        maxHeight: '100vh',
        data: {
                emergencyCaseId:outstandingCase.emergencyCaseId,
                emergencyNumber:outstandingCase.emergencyNumber
            }
    });
  }

  openMediaDialog($event:{patientId: number, tagNumber: string | null}): void {
    const tagNumber = $event.tagNumber;
    const patientId = $event.patientId;
    this.dialog.open(MediaDialogComponent, {
        minWidth: '50%',
        data: {
            tagNumber,
            patientId,
        },
    });
  }

  openCase(caseSearchResult:OutstandingAssignment2)
  {

    const result:SearchResponse = {

      EmergencyCaseId: caseSearchResult.emergencyCaseId,
      EmergencyNumber: caseSearchResult.emergencyNumber,
      CallDateTime: caseSearchResult.callDateTime.toString(),
      callerDetails: caseSearchResult.callerDetails,
      AnimalTypeId: 0,
      AnimalType: '',
      PatientId: 0,
      MediaCount: 0,
      TagNumber: '',
      CallOutcomeId: 0,
      CallOutcome: undefined,
      sameAsNumber: undefined,
      Location: caseSearchResult.location,
      Latitude: caseSearchResult.lat,
      Longitude: caseSearchResult.lng,
      CurrentLocation: undefined,

    };

    this.openEmergencyCase.emit(result);
  }

  
  toggleVehicleLocation($event:MatSlideToggleChange, vehicleId: number){
    this.locationService.toggleVehicleLocation(vehicleId, $event.checked);
  }

  autoRefreshToggled(){
    this.outstandingCaseService.toggleAutoRefresh();
  }

  filterChipSelected(groupName: string, chip: MatChip) {

    this.incomingObject = {
      group: groupName,
      value: chip.value.trim(),
      selected: chip.selected
    };

    if(this.incomingObject.selected) {

      this.filterKeysArray.push(this.incomingObject);
    }

    if(!this.incomingObject.selected) {
      const index = this.filterKeysArray.findIndex(obj=> obj.group === this.incomingObject.group &&
      obj.value === this.incomingObject.value);
      this.filterKeysArray.splice(index,1);
    }

    this.matChipObs.next(null);

  }

  openCaseFromMap(emergencyCase:SearchResponse){

    this.openEmergencyCase.emit(emergencyCase);

  }
  

  ngOnDestroy(){
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

  }
  
}
