import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallerAutocompleteComponent } from './caller-autocomplete.component';

describe('CallerAutocompleteComponent', () => {
  let component: CallerAutocompleteComponent;
  let fixture: ComponentFixture<CallerAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CallerAutocompleteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CallerAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
