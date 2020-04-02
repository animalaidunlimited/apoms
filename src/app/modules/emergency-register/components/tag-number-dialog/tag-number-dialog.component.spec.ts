import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagNumberDialog } from './tag-number-dialog.component';

describe('TagNumberDialog', () => {
  let component: TagNumberDialog;
  let fixture: ComponentFixture<TagNumberDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagNumberDialog ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagNumberDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
