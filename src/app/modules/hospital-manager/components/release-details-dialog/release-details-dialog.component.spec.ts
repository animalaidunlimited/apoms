import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseDetailsDialogComponent } from './release-details-dialog.component';

describe('ReleaseDetailsDialogComponent', () => {
  let component: ReleaseDetailsDialogComponent;
  let fixture: ComponentFixture<ReleaseDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReleaseDetailsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
