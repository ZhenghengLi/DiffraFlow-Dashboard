import { Component, OnInit, OnDestroy } from '@angular/core';
import { MetricsDataService } from '../metrics-data.service';

@Component({
    selector: 'app-monitor',
    templateUrl: './monitor.component.html',
    styleUrls: ['./monitor.component.scss'],
})
export class MonitorComponent implements OnInit, OnDestroy {
    constructor(private metrics_data: MetricsDataService) {}

    ngOnInit(): void {
        console.log('init monitor: metrics_data: ', this.metrics_data.myId);
    }

    ngOnDestroy(): void {
        console.log('destroy monitor');
    }
}
