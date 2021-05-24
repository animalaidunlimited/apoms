import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { PrintContentComponent } from './print-content.component';

describe('PrintContentComponent', () => {
  let component: PrintContentComponent;
  let fixture: ComponentFixture<PrintContentComponent>;

  const printTemplate = [{
      printTemplateId: 1,
      templateName: '',
      showTemplateImage: false,
      backgroundImageUrl: '',
      paperDimensions: [{
        paperDimensionsId: 1,
        name: '',
        width: '',
        height: ''
      }],
      orientation: '',
      printElements: [],
      updated: false,
      updateDateTime: ''
    }];


  const fakeActivatedRoute = {
    snapshot: { params: { printTemplate: JSON.stringify(printTemplate) } } };

    const formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: ActivatedRoute, useValue: fakeActivatedRoute},
        { provide: FormBuilder, useValue: formBuilder }],
      declarations: [ PrintContentComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
