import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseRequestFormComponent } from './release-request-form.component';

describe('ReleaseRequestFormComponent', () => {
  let component: ReleaseRequestFormComponent;
  let fixture: ComponentFixture<ReleaseRequestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReleaseRequestFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseRequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
