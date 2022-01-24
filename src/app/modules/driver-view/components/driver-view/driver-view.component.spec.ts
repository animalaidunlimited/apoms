import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverViewComponent } from './driver-view.component';
import { MaterialModule } from './../../../../material-module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
describe('DriverViewComponent', () => {
  let component: DriverViewComponent;
  let fixture: ComponentFixture<DriverViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:[
        HttpClientTestingModule,
        MaterialModule,
        BrowserAnimationsModule,
        RouterModule.forRoot([])
      ],
      declarations: [ DriverViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
