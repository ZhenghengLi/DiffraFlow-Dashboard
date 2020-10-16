import { Component, OnInit, OnDestroy } from '@angular/core';
import { MetricsDataService } from './metrics-data.service';

@Component({
    selector: 'app-metrics',
    templateUrl: './metrics.component.html',
    styleUrls: ['./metrics.component.scss'],
})
export class MetricsComponent implements OnInit, OnDestroy {
    constructor(private metrics_data: MetricsDataService) {}

    ngOnInit(): void {
        this.metrics_data.start();
    }

    ngOnDestroy(): void {
        this.metrics_data.stop();
    }
}
