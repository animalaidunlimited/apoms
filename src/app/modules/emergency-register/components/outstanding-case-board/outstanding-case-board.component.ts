
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Renderer2, ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatChip, MatChipList } from '@angular/material/chips';
import { ThemePalette } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, takeUntil, map } from 'rxjs/operators';
import { AnimalType } from 'src/app/core/models/animal-type';
import { DriverAssignment } from 'src/app/core/models/driver-view';
import { EmergencyCode } from 'src/app/core/models/emergency-record';
import { ActiveVehicleLocation } from 'src/app/core/models/location';
import { OutstandingAssignment } from 'src/app/core/models/outstanding-case';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { LocationService } from 'src/app/core/services/location/location.service';
import { MessagingService } from '../../services/messaging.service';
import { OutstandingCaseService } from '../../services/outstanding-case.service';


export interface FilterKeys {
  group: string;
  value: string;
  selected: boolean;
}
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'outstanding-case-board',
  templateUrl: './outstanding-case-board.component.html',
  styleUrls: ['./outstanding-case-board.component.scss'],
  animations:
  [
    trigger('rescueMoved',
    [
      state('void', style({
        background: 'transparent'
      })),
      state('moved',style({
        background: 'lightsteelblue'

    })),
    state('still', style({
      background: 'transparent'
    })),
    transition('moved => still', [
      animate('1s')
    ]),
    transition('still => moved', [
      animate('0s')
    ])

  ])
]
})
export class OutstandingCaseBoardComponent implements OnInit,OnDestroy {

  vehicleId$!: Observable<(number | null)[]>;

  ambulanceLocations$!:Observable<ActiveVehicleLocation[]>;

  outstandingCases$!:  Observable<(OutstandingAssignment | DriverAssignment)[]>;

  receivedVehicleList$!:  Observable<(OutstandingAssignment | DriverAssignment)[]>;

  searchForm:FormGroup = new FormGroup({});

  searchValue!: string;

  ngUnsubscribe = new Subject();

  filterKeysArray : FilterKeys[] = [];

  showAmbulancePaths = false;
  autoRefresh = false;
  hideList = true;
  hideMap = true;
  notificationPermissionGranted = false;
  removable = true;

  refreshColour:ThemePalette = 'primary';
  filterBtnColor: ThemePalette = 'accent';

  matChipObs = new BehaviorSubject(null);
  refreshColour$!:BehaviorSubject<ThemePalette>;
  incomingObject!: FilterKeys;

  loading = this.outstandingCaseService.loading;

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

  searchChange$!:Observable<string>;

   @ViewChildren('filterChips') filterChips!: MatChipList[];

  @ViewChild('filterDiv') filterDiv!: ElementRef;


  constructor(
    private outstandingCaseService: OutstandingCaseService,
    private locationService: LocationService,
    private fb: FormBuilder,
    private messagingService: MessagingService,
    private changeDetector: ChangeDetectorRef,
    private dropDown: DropdownService,
    private outStandingCaseService: OutstandingCaseService,
    private renderer: Renderer2) { }

  ngOnInit(): void {

    this.renderer.listen('window', 'click',(e:Event)=>{

      // The below logic made the filter list disappear when click outside it.
      if(!this.filterDiv.nativeElement.contains(e.target)) {
        this.hideList= true;
        this.showAmbulancePaths = false;
        this.changeDetector.detectChanges();
      }

      });

    this.outStandingCaseService.initialise();


    this.outstandingCaseService.filterCases(
      this.matChipObs,
      this.filterKeysArray,
      this.ngUnsubscribe
    );

    this.receivedVehicleList$ =  this.outstandingCaseService.getOutstandingCasesByVehicleId(null);

    this.outstandingCases$ = this.outstandingCaseService.outstandingCases$.pipe(
      map(outstandingCases => outstandingCases.filter(outstandingCase => outstandingCase.rescueAmbulanceId !== null))
    );

    this.vehicleId$ = this.outstandingCaseService.getVehicleId();


    this.searchForm = this.fb.group({
      searchTerm: ['']
    });


   this.searchForm.get('searchTerm')?.valueChanges
    .pipe(
      distinctUntilChanged(),
      debounceTime(250),
      startWith(''),
      takeUntil(this.ngUnsubscribe)
      ).subscribe(searchValue => this.outstandingCaseService.onSearchChange(
        searchValue
    ));

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

  refreshCases(){

    this.outstandingCaseService.loading.next(true);

    this.outstandingCaseService.initialise();

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



  ngOnDestroy(){
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

  }

}
