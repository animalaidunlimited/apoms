import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCaseMediaComponent } from './add-case-media.component';

describe('AddCaseMediaComponent', () => {
  let component: AddCaseMediaComponent;
  let fixture: ComponentFixture<AddCaseMediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddCaseMediaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCaseMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
