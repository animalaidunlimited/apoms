import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickEditDialog } from './quick-edit.component';

describe('QuickEditDialog', () => {
  let component: QuickEditDialog;
  let fixture: ComponentFixture<QuickEditDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickEditDialog ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickEditDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
