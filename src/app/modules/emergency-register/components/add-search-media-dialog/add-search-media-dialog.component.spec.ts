import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AddSearchMediaDialogComponent } from './add-search-media-dialog.component';

@Component({
  selector: 'app-add-search-media-dialog',
  template: '<p>Mock add-search-media Component</p>'
})
class MockAddSearchMediaDialogComponent {}

describe('AddSearchMediaDialogComponent', () => {
  let component: AddSearchMediaDialogComponent;
  let fixture: ComponentFixture<AddSearchMediaDialogComponent>;

  const mockDialogRef = {
    open: jasmine.createSpy('open'),
    close: jasmine.createSpy('close')
  };

  const dialogData = {};

  let dialog: MatDialogRef<MockAddSearchMediaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddSearchMediaDialogComponent, MockAddSearchMediaDialogComponent ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: dialogData },
        {
        provide: MatDialogRef,
        useValue: mockDialogRef
      }]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSearchMediaDialogComponent);
    component = fixture.componentInstance;

    dialog = TestBed.get(MatDialog);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
