import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';

import { UsersPageComponent } from './users-page.component';

describe('UsersPageComponent', () => {
    let component: UsersPageComponent;
    let fixture: ComponentFixture<UsersPageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [UsersPageComponent],
            imports: [HttpClientTestingModule, FormsModule, ReactiveFormsModule]
        }).compileComponents();
    }));

    beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
        fixture = TestBed.createComponent(UsersPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
