import { Overlay } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from 'src/app/material-module';
import { PrintElementFilter } from '../pipes/print-element-filter';

import { PrintTemplatesPageComponent } from './print-templates-page.component';

describe('PrintTemplatesPageComponent', () => {
  let component: PrintTemplatesPageComponent;
  let fixture: ComponentFixture<PrintTemplatesPageComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        BrowserAnimationsModule
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
  });

  beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
    fixture = TestBed.createComponent(PrintTemplatesPageComponent);
    component = fixture.componentInstance;

    component.printPage = component.createNewForm();

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
