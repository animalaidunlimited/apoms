import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverViewIconsComponent } from './driver-view-icons.component';
import { MaterialModule } from 'src/app/material-module';
describe('DriverViewIconsComponent', () => {
  let component: DriverViewIconsComponent;
  let fixture: ComponentFixture<DriverViewIconsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:[MaterialModule],
      
declarations: [ DriverViewIconsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverViewIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
