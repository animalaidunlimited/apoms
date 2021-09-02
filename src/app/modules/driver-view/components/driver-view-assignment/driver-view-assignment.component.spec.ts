import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from './../../../../material-module';
import { DriverViewAssignmentComponent } from './driver-view-assignment.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('DriverViewAssignmentComponent', () => {
  let component: DriverViewAssignmentComponent;
  let fixture: ComponentFixture<DriverViewAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:[
      
        HttpClientTestingModule,
        MaterialModule
      ],
      declarations: [ DriverViewAssignmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverViewAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
