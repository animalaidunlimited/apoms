import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { PrintContentComponent } from './print-content.component';

describe('PrintContentComponent', () => {
  let component: PrintContentComponent;
  let fixture: ComponentFixture<PrintContentComponent>;

  const fakeActivatedRoute = {
    snapshot: { params: { printTemplate: {
      printTemplateId: 1,
      templateName: '',
      showTemplateImage: false,
      backgroundImageUrl: '',
      paperDimensions: {
        paperDimensionsId: 1,
        name: '',
        width: '',
        height: ''
      },
      orientation: '',
      printElements: [],
      updated: false,
      updateDateTime: ''
    } } } };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        {
        provide: ActivatedRoute,
          useValue: fakeActivatedRoute
        }],
      declarations: [ PrintContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
