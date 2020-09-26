import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintWrapperComponent } from './print-wrapper.component';

describe('PrintWrapperComponent', () => {
  let component: PrintWrapperComponent;
  let fixture: ComponentFixture<PrintWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
