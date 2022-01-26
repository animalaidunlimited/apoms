import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganisationDropdownComponent } from './organisation-dropdown.component';

describe('ProblemComponent', () => {
  let component: OrganisationDropdownComponent;
  let fixture: ComponentFixture<OrganisationDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganisationDropdownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganisationDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
