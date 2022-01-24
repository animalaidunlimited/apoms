import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VehicleListPageComponent } from './vehicle-list-page.component';
import { MaterialModule } from './../../../../material-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
describe('VehicleListPageComponent', () => {
  let component: VehicleListPageComponent;
  let fixture: ComponentFixture<VehicleListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:[
      
  HttpClientTestingModule,
        FormsModule, 
        ReactiveFormsModule,
        MaterialModule,
        BrowserAnimationsModule
      ],
      declarations: [ VehicleListPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VehicleListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
