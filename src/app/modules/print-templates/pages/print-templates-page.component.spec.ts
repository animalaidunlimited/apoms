import { Overlay } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { PrintElementFilter } from 'apoms/src/app/modules/print-templates/pipes/print-element-filter';

import { PrintTemplatesPageComponent } from './print-templates-page.component';

describe('PrintTemplatesPageComponent', () => {
  let component: PrintTemplatesPageComponent;
  let fixture: ComponentFixture<PrintTemplatesPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule
      ],
      providers: [
        MatSnackBar,
        Overlay
      ],
      declarations: [
        PrintTemplatesPageComponent,
        PrintElementFilter
      ]
    })
    .compileComponents();
  }));

  beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
    fixture = TestBed.createComponent(PrintTemplatesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
