import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DriverActionDialogComponent } from './driver-action-dialog.component';
import { MaterialModule } from './../../../../material-module';
describe('DriverActionDialogComponent', () => {
  let component: DriverActionDialogComponent;
  let fixture: ComponentFixture<DriverActionDialogComponent>;

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
     ],
      declarations: [ DriverActionDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverActionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
