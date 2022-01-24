import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VehicleStaffAssignerComponent } from './vehicle-staff-assigner.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MaterialModule } from '../../../../material-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
describe('VehicleStaffAssignerComponent', () => {
  let component: VehicleStaffAssignerComponent;
  let fixture: ComponentFixture<VehicleStaffAssignerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [

        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        MaterialModule,
        BrowserAnimationsModule
      ],
      declarations: [ VehicleStaffAssignerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VehicleStaffAssignerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
