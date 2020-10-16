import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeLineChartComponent } from './time-line-chart.component';

describe('TimeLineChartComponent', () => {
    let component: TimeLineChartComponent;
    let fixture: ComponentFixture<TimeLineChartComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TimeLineChartComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TimeLineChartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
