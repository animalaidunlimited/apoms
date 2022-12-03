/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';

import { AreaShiftComponent } from './area-shift.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material-module';
import { RotaService } from 'src/app/modules/staff-rota/services/rota.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('AreaShiftComponent', () => {
  let component: AreaShiftComponent;
  let fixture: ComponentFixture<AreaShiftComponent>;
  let service: RotaService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
     imports: [     
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        BrowserAnimationsModule
    ],
      declarations: [ AreaShiftComponent ]
    })
    .compileComponents();
  }));

  beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
    fixture = TestBed.createComponent(AreaShiftComponent);
    service = TestBed.inject(RotaService);
    component = fixture.componentInstance;

    component.inputAreaShift = service.generateDefaultAreaShift();

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
