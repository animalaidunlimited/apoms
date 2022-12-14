
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Renderer2, ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { UntypedFormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatChipListbox } from '@angular/material/chips';
import { ThemePalette } from '@angular/material/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, skip, startWith, take, takeUntil } from 'rxjs/operators';
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
  filters: string[]
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

  @ViewChildren('filterChips') filterChips!: MatChipListbox[];

  @ViewChild('filterDiv') filterDiv!: ElementRef;

  ngUnsubscribe = new Subject();

  ambulanceLocations$!:Observable<ActiveVehicleLocation[]>;
  autoRefresh = false;

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
    showTitle: 'Emergency code',
    groupTitle: 'emergencyCode',
    groupValues: []
  },
  {
    groupId: 3,
    showTitle: 'Animal type',
    groupTitle: 'animalType',
    groupValues: []
  }];

  casesFiltered = false;

  filterBtnColor: ThemePalette = 'accent';
  filterKeysArray : FilterKeys[] = [];
  hideList = true;
  incomingObject!: FilterKeys;
  hideMap = true;
  loading = this.outstandingCaseService.loading;
  notificationPermissionGranted = false;
  receivedVehicleList$!:  Observable<(OutstandingAssignment | DriverAssignment)[]>;
  refreshColour:ThemePalette = 'primary';
  refreshColour$!:BehaviorSubject<ThemePalette>;
  searchChange$!:Observable<string>;
  searchForm:FormGroup = this.fb.group({searchTerm: ['']});
  searchValue!: string;
  selectedChips = new FormGroup({});
  showAmbulancePaths = false;
  vehicleId$!: Observable<(number | null)[]>;


  constructor(
    private outstandingCaseService: OutstandingCaseService,
    private locationService: LocationService,
    private fb: UntypedFormBuilder,
    private messagingService: MessagingService,
    private changeDetector: ChangeDetectorRef,
    private dropDown: DropdownService,
    private renderer: Renderer2) {

     }

  ngOnInit(): void {
    
    this.initialiseCaseFilter();    

    this.outstandingCaseService.initialise(this.selectedChips.valueChanges.pipe(startWith(this.selectedChips.value)));  

    this.outstandingCaseService.outstandingCases$.pipe(skip(1),take(1)).subscribe(() => 
      this.receivedVehicleList$ = this.outstandingCaseService.getOutstandingCasesByVehicleId(null)
    );    

    this.vehicleId$ = this.outstandingCaseService.getVehicleIds();

    this.ambulanceLocations$ = this.locationService.ambulanceLocations$;

    this.refreshColour$ = this.outstandingCaseService.refreshColour;
    
    this.listenForClicks();    
    this.listenToSearchTerm();
    this.listenToRefreshColours();
    this.addAnimalTypesToFilter();
    this.getEmergencyCodes();
    this.setupNotificationPermissions();
    this.watchFilter();

  }

  ngOnDestroy(){
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

  }

  private watchFilter() : void {

    this.selectedChips.valueChanges.pipe(takeUntil(this.ngUnsubscribe), filter(() => this.searchForm.valid)).subscribe(value => {

      const controls = Object.entries(value);

      this.casesFiltered = controls.some((control:any) => control[1]?.length > 0)

    });

    // this.selectedChips.valueChanges.subscribe(() => {

      

    // })

  }

  private getEmergencyCodes() {
    this.dropDown.getEmergencyCodes()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((emergencyCodes: EmergencyCode[]) => {
        emergencyCodes.forEach(emcode => {

          this.caseFilter.forEach(filterObject => {

            if (filterObject.groupId === 2) {

              filterObject.groupValues.push({
                id: emcode.EmergencyCodeId,
                value: emcode.EmergencyCode
              });

            }

          });

        });
      });
  }

  private addAnimalTypesToFilter() {
    this.dropDown.getAnimalTypes()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((animalType: AnimalType[]) => {

        animalType.forEach(type => {

          this.caseFilter.forEach(filterObject => {

            if (filterObject.groupId === 3) {

              filterObject.groupValues.push({
                id: type.AnimalTypeId,
                value: type.AnimalType
              });

            }

          });

        });

      });
  }

  private listenToRefreshColours() {
    this.refreshColour$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(colour => {
        this.refreshColour = colour;
        this.changeDetector.detectChanges();
      });
  }

  private listenToSearchTerm() {
    this.searchForm.get('searchTerm')?.valueChanges
      .pipe(
        distinctUntilChanged(),
        debounceTime(250),
        startWith(''),
        takeUntil(this.ngUnsubscribe)
      ).subscribe(searchValue => this.outstandingCaseService.onSearchChange(
        searchValue
      ));
  }

  private listenForClicks() {
    this.renderer.listen('window', 'click', (e: Event) => {

      // The below logic made the filter list disappear when click outside it.
      if (!this.filterDiv.nativeElement.contains(e.target)) {
        this.hideList = true;
        this.showAmbulancePaths = false;
        this.changeDetector.detectChanges();
      }

    });
  }

  initialiseCaseFilter() : void {

    this.caseFilter.forEach(element => {

      this.selectedChips.addControl(element.groupTitle, new FormControl<string[]>([]));

    });
}



setupNotificationPermissions(){

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

    this.outstandingCaseService.initialise(this.selectedChips.valueChanges);

  }


  toggleVehicleLocation($event:MatSlideToggleChange, vehicleId: number){
    this.locationService.toggleVehicleLocation(vehicleId, $event.checked);
  }

  autoRefreshToggled(){
    this.outstandingCaseService.toggleAutoRefresh();
  }

  removeFilter(groupTitle : string, option : string) : void {

    const filterValue = this.selectedChips.get(groupTitle)?.value as string[];

    const index = filterValue?.indexOf(option);

    if (index >= 0) {
      filterValue.splice(index, 1);
        this.selectedChips.get(groupTitle)?.setValue(filterValue);    
    }

  }

}
