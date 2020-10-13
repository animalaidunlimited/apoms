import { Overlay } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';

import { OutstandingCaseMapComponent } from './outstanding-case-map.component';

describe('OutstandingCaseMapComponent', () => {
  let component: OutstandingCaseMapComponent;
  let fixture: ComponentFixture<OutstandingCaseMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        AngularFireMessagingModule,
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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
