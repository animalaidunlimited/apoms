import { Overlay } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatSnackBar } from '@angular/material/snack-bar';
import { createMapSpy, createMapConstructorSpy } from 'src/app/core/testing/fake-google-map-utils';
import { DEFAULT_OPTIONS } from 'src/app/core/testing/google-map';
import { environment } from 'src/environments/environment';

import { OutstandingCaseMapComponent } from './outstanding-case-map.component';

describe('OutstandingCaseMapComponent', () => {
  let component: OutstandingCaseMapComponent;
  let fixture: ComponentFixture<OutstandingCaseMapComponent>;

  let mapConstructorSpy: jasmine.Spy;
  let mapSpy: jasmine.SpyObj<google.maps.Map>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        AngularFireMessagingModule,
        GoogleMapsModule,
        AngularFireModule.initializeApp(environment.firebase)
      ],
      providers: [
        MatSnackBar,
        Overlay
      ],
      declarations: [ OutstandingCaseMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutstandingCaseMapComponent);
    component = fixture.componentInstance;

    mapSpy = createMapSpy(DEFAULT_OPTIONS);
    mapConstructorSpy = createMapConstructorSpy(mapSpy);

    TestBed.compileComponents();

    fixture.detectChanges();
  });

  afterEach(() => {
    (window.google as any) = undefined;
  });

  //it('should create', () => {
  //  expect(component).toBeTruthy();
  //});
});

