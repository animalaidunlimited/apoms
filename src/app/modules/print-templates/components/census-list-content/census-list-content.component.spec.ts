import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { CensusListContentComponent } from './census-list-content.component';

describe('CensusListContentComponent', () => {
  let component: CensusListContentComponent;
  let fixture: ComponentFixture<CensusListContentComponent>;

  const fakeActivatedRoute = { };

  beforeEach(async(() => {
    TestBed.configureTestingModule({

      declarations: [
        CensusListContentComponent,
        HttpClientTestingModule
      ],
      providers: [
        {provide: ActivatedRoute, useValue: fakeActivatedRoute}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CensusListContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
