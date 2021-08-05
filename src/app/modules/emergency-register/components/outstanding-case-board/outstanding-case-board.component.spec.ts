import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OutstandingCaseBoardComponent } from './outstanding-case-board.component';
import { OutstandingCaseService } from './../../services/outstanding-case.service';
import { RescueDetailsService } from './../../services/rescue-details.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('OutstandingCaseBoardComponent', () => {
  let component: OutstandingCaseBoardComponent;
  let fixture: ComponentFixture<OutstandingCaseBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:[
        MatDialogModule,
        HttpClientTestingModule,
        FormsModule, 
        ReactiveFormsModule,
      ],
      providers:[
        OutstandingCaseService,
        RescueDetailsService,
        {
          provide: MatDialogRef,
          useValue: {}
        },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
      declarations: [ OutstandingCaseBoardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OutstandingCaseBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
