import { Overlay } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { createMapSpy, createMapConstructorSpy } from 'src/app/core/testing/fake-google-map-utils';
//import { DEFAULT_OPTIONS } from 'src/app/core/testing/google-map';
import { environment } from 'src/environments/environment';
import { OutstandingCaseMapComponent } from './outstanding-case-map.component';

import { SharedPipesModule } from 'src/app/shared-pipes.module';
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
        BrowserAnimationsModule,
        GoogleMapsModule,
        AngularFireModule.initializeApp(environment.firebase),
        SharedPipesModule
      ],
      providers: [
        MatSnackBar,
        Overlay,

      ],
      declarations: [ OutstandingCaseMapComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutstandingCaseMapComponent);
    component = fixture.componentInstance;

    //mapSpy = createMapSpy(DEFAULT_OPTIONS);
    //mapConstructorSpy = createMapConstructorSpy(mapSpy);

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

