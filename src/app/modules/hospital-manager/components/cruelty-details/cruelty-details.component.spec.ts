import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrueltyDetailsComponent } from './cruelty-details.component';

describe('CrueltyDetailsComponent', () => {
  let component: CrueltyDetailsComponent;
  let fixture: ComponentFixture<CrueltyDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrueltyDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrueltyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
