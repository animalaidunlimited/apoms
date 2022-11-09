/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';

import { RotationPeriodComponent } from './rotation-period.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material-module';
import { RotaService } from '../../services/rota.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('RotationPeriodComponent', () => {
  let component: RotationPeriodComponent;
  let fixture: ComponentFixture<RotationPeriodComponent>;
  let service: RotaService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [     
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        MaterialModule,
        BrowserAnimationsModule
    ],
      declarations: [ RotationPeriodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
    fixture = TestBed.createComponent(RotationPeriodComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(RotaService);

    component.inputPeriod = "";

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
