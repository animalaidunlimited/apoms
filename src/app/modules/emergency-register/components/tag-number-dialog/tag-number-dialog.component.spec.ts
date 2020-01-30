import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagNumberDialogComponent } from './tag-number-dialog.component';

describe('TagNumberDialogComponent', () => {
  let component: TagNumberDialogComponent;
  let fixture: ComponentFixture<TagNumberDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagNumberDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagNumberDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
