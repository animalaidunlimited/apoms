import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TeamsPageComponent } from 'src/app/pages/street-treat/pages/teams-page/teams-page.component';

import { TeamDetailsService } from './team-details.service';

describe('TeamDetailsService', () => {
    let service: TeamDetailsService;
    let component: TeamsPageComponent;
    let fixture: ComponentFixture<TeamsPageComponent>;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                ReactiveFormsModule,
                HttpClientTestingModule,
            ],
            declarations: [TeamsPageComponent],
        });
    });

    beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
        service = TestBed.inject(TeamDetailsService);
        fixture = TestBed.createComponent(TeamsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));
    afterEach(function(done) {
        component.teamDetails.reset();
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('Invalid form - team name is required', () => {
        component.teamDetails.get('TeamName')?.setValue(null);
        expect(component.teamDetails.valid).toBe(false);
    });
    it('Invalid form - Capacity is required', () => {
        component.teamDetails.get('Capacity')?.setValue(null);
        expect(component.teamDetails.valid).toBe(false);
    });
});
