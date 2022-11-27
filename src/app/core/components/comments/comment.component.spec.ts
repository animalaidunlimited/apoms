/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { CommentComponent } from './comment.component';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Overlay } from '@angular/cdk/overlay';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('CommentComponent', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;

  const permissions$ = of({componentPermissionLevel: 2});  

  const fakeActivatedRoute = { params: of({}),
  snapshot: {
    fragment: 1
  }};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule],
      declarations: [ CommentComponent ],
      providers: [
        MatSnackBar,
        Overlay,
        { provide: ActivatedRoute, useValue: fakeActivatedRoute }
      ]
    })
    .compileComponents();
  }));

  beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    }));


  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


