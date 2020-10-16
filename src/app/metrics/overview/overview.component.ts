import { Component, OnInit, OnDestroy } from '@angular/core';
import { MetricsDataService } from '../metrics-data.service';

@Component({
    selector: 'app-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit, OnDestroy {
    constructor(private _metricsData: MetricsDataService) {}

    ngOnInit(): void {
        console.log('init overview');
    }

    ngOnDestroy(): void {
        console.log('destroy overview');
    }
}
