import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignReleaseDialogComponent } from './assign-release-dialog.component';

describe('AssignReleaseDialogComponent', () => {
  let component: AssignReleaseDialogComponent;
  let fixture: ComponentFixture<AssignReleaseDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignReleaseDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignReleaseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
