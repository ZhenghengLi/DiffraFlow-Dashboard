import { Component, OnInit, OnDestroy } from '@angular/core';
import { MetricsDataService } from '../metrics-data.service';

@Component({
    selector: 'app-ingester',
    templateUrl: './ingester.component.html',
    styleUrls: ['./ingester.component.scss'],
})
export class IngesterComponent implements OnInit, OnDestroy {
    constructor(private _metricsData: MetricsDataService) {}

    ngOnInit(): void {
        console.log('init ingester');
    }

    ngOnDestroy(): void {
        console.log('destroy ingester');
    }
}
