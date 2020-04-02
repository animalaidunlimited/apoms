import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimalHeaderComponent } from './animal-header.component';

describe('AnimalHeaderComponent', () => {
  let component: AnimalHeaderComponent;
  let fixture: ComponentFixture<AnimalHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnimalHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimalHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
