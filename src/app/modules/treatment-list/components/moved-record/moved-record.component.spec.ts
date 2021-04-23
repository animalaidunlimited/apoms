import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovedRecordComponent } from './moved-record.component';

describe('MovedRecordComponent', () => {
  let component: MovedRecordComponent;
  let fixture: ComponentFixture<MovedRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MovedRecordComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovedRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
