import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DriverActionDialogComponent } from './driver-action-dialog.component';
import { MaterialModule } from './../../../../material-module';
import { FormBuilder, Validators } from '@angular/forms';


describe('DriverActionDialogComponent', () => {
  let component: DriverActionDialogComponent;
  let fixture: ComponentFixture<DriverActionDialogComponent>;
  const formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        HttpClientTestingModule,
        MaterialModule
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {}
        },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: FormBuilder, useValue: formBuilder } 
     ],
      declarations: [ DriverActionDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverActionDialogComponent);
    component = fixture.componentInstance;
    component.formGroup = formBuilder.group({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
