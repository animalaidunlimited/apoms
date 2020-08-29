import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCensusDialogComponent } from './update-census-dialog.component';

describe('UpdateCensusDialogComponent', () => {
  let component: UpdateCensusDialogComponent;
  let fixture: ComponentFixture<UpdateCensusDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateCensusDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateCensusDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
