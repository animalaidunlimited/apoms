import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimalSelectionComponent } from './animal-selection.component';

describe('AnimalSelectionComponent', () => {
  let component: AnimalSelectionComponent;
  let fixture: ComponentFixture<AnimalSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnimalSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimalSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
