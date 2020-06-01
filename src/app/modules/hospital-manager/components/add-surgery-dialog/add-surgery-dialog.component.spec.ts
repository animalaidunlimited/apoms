import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSurgeryDialogComponent } from './add-surgery-dialog.component';

describe('AddSurgeryDialogComponent', () => {
  let component: AddSurgeryDialogComponent;
  let fixture: ComponentFixture<AddSurgeryDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSurgeryDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSurgeryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
