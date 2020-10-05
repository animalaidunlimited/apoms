import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintTemplatesPageComponent } from './print-templates-page.component';

describe('PrintTemplatesPageComponent', () => {
  let component: PrintTemplatesPageComponent;
  let fixture: ComponentFixture<PrintTemplatesPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintTemplatesPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintTemplatesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
