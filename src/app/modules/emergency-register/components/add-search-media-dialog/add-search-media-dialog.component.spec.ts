import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSearchMediaDialogComponent } from './add-search-media-dialog.component';

describe('AddSearchMediaDialogComponent', () => {
  let component: AddSearchMediaDialogComponent;
  let fixture: ComponentFixture<AddSearchMediaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddSearchMediaDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSearchMediaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
