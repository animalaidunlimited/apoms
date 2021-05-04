import { inject, TestBed } from '@angular/core/testing';

import { CallerDetailsService } from './caller-details.service';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('CallerDetailsService', () => {

    let service: CallerDetailsService;

    beforeEach(() =>
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                FormsModule,
                ReactiveFormsModule
            ],
            providers: [CallerDetailsService]
        }),
    );

    beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
        service = TestBed.inject(CallerDetailsService);

    }));


    it('should be created', () => {

        expect(service).toBeTruthy();
    });
});
