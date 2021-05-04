import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material-module';
import { CallerDetailsService } from '../caller-details/caller-details.service';

import { CallerAutocompleteComponent } from './caller-autocomplete.component';

describe('CallerAutocompleteComponent', () => {
  let component: CallerAutocompleteComponent;
  let fixture: ComponentFixture<CallerAutocompleteComponent>;
  let service: CallerDetailsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        BrowserAnimationsModule
      ],
      providers: [ CallerDetailsService ],
      declarations: [ CallerAutocompleteComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CallerAutocompleteComponent);
    service = TestBed.inject(CallerDetailsService);

    component = fixture.componentInstance;

    component.incomingCallerForm = service.getCallerFormGroup();

    fixture.detectChanges();
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Invalid form - caller name only', () => {
    component.callerForm
        .get('callerName')
        ?.setValue('Alfred Bumblehorn');

    expect(component.callerForm.valid).toEqual(false);
});

it('Invalid form - caller number only', () => {
    component.callerForm
        .get('callerNumber')
        ?.setValue('8956874569');

    expect(component.callerForm.valid).toEqual(false);
});

it('Invalid form - alternative only', () => {
    component.callerForm
        .get('callerAlternativeNumber')
        ?.setValue('8956874569');

    expect(component.callerForm.valid).toEqual(false);
});

it('Valid form - caller name and number only', () => {
    component.callerForm
        .get('callerName')
        ?.setValue('Alfred Bumblehorn');
    component.callerForm
        .get('callerNumber')
        ?.setValue('8956874569');

    expect(component.callerForm.valid).toEqual(true);
});

it('Valid form - caller name, number, and alternative', () => {
    component.callerForm
        .get('callerName')
        ?.setValue('Alfred Bumblehorn');
    component.callerForm
        .get('callerNumber')
        ?.setValue('8956874569');
    component.callerForm
        .get('callerAlternativeNumber')
        ?.setValue('8905797444');

    expect(component.callerForm.valid).toEqual(true);
});

it('Valid form - international number', () => {
    component.callerForm
        .get('callerName')
        ?.setValue('Alfred Bumblehorn');
    component.callerForm
        .get('callerNumber')
        ?.setValue('+8956874569');

    expect(component.callerForm.valid).toEqual(true);
});

it('Invalid form - Wrong placement of +', () => {
    component.callerForm
        .get('callerName')
        ?.setValue('Alfred Bumblehorn');
    component.callerForm
        .get('callerNumber')
        ?.setValue('8956+874569');

    expect(component.callerForm.valid).toEqual(false);
});

it('Invalid form - 2 +', () => {
    component.callerForm
        .get('callerName')
        ?.setValue('Alfred Bumblehorn');
    component.callerForm
        .get('callerNumber')
        ?.setValue('++8956874569');

    expect(component.callerForm.valid).toEqual(false);
});

it('Invalid form - Alternative number: 2 +', () => {
    component.callerForm
        .get('callerName')
        ?.setValue('Alfred Bumblehorn');
    component.callerForm
        .get('callerNumber')
        ?.setValue('+8956874569');
    component.callerForm
        .get('callerAlternativeNumber')
        ?.setValue('++8905797444');

    expect(component.callerForm.valid).toEqual(false);
});

it('Invalid form - all spaces', () => {
    component.callerForm
        .get('callerName')
        ?.setValue('Alfred Bumblehorn');
    component.callerForm
        .get('callerNumber')
        ?.setValue('          ');

    expect(component.callerForm.valid).toEqual(false);
});

it('Invalid form - Letters', () => {
    component.callerForm
        .get('callerName')
        ?.setValue('Alfred Bumblehorn');
    component.callerForm
        .get('callerNumber')
        ?.setValue('Letters are here');

    expect(component.callerForm.valid).toEqual(false);
});

it('Invalid form - symbols', () => {
    component.callerForm
        .get('callerName')
        ?.setValue('Alfred Bumblehorn');
    component.callerForm
        .get('callerNumber')
        ?.setValue('6668889$%^**');

    expect(component.callerForm.valid).toEqual(false);
});

it('Invalid form - alternative symbols', () => {
    component.callerForm
        .get('callerName')
        ?.setValue('Alfred Bumblehorn');
    component.callerForm
        .get('callerNumber')
        ?.setValue('6668889');
    component.callerForm
        .get('callerAlternativeNumber')
        ?.setValue('6668889$%^**');

    expect(component.callerForm.valid).toEqual(false);
});

it('Invalid form - alternative letter', () => {
    component.callerForm
        .get('callerName')
        ?.setValue('Alfred Bumblehorn');
    component.callerForm
        .get('callerNumber')
        ?.setValue('6668889');
    component.callerForm
        .get('callerAlternativeNumber')
        ?.setValue('Letters here');

    expect(component.callerForm.valid).toEqual(false);
});

it('Invalid form - alternative all spaces', () => {
    component.callerForm
        .get('callerName')
        ?.setValue('Alfred Bumblehorn');
    component.callerForm
        .get('callerNumber')
        ?.setValue('6668889');
    component.callerForm
        .get('callerAlternativeNumber')
        ?.setValue('Letters here');

    expect(component.callerForm.valid).toEqual(false);
});


});
