import { Component, OnInit, OnDestroy } from '@angular/core';
import { MetricsDataService } from './metrics-data.service';

@Component({
    selector: 'app-metrics',
    templateUrl: './metrics.component.html',
    styleUrls: ['./metrics.component.scss'],
})
export class MetricsComponent implements OnInit, OnDestroy {
    constructor(private _metricsData: MetricsDataService) {}

    ngOnInit(): void {
        this._metricsData.start();
    }

    ngOnDestroy(): void {
        this._metricsData.stop();
    }
}
