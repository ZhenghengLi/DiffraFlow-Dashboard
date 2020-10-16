import { Component, OnInit, OnDestroy } from '@angular/core';
import { MetricsDataService } from '../metrics-data.service';

@Component({
    selector: 'app-dispatcher',
    templateUrl: './dispatcher.component.html',
    styleUrls: ['./dispatcher.component.scss'],
})
export class DispatcherComponent implements OnInit, OnDestroy {
    constructor(private metrics_data: MetricsDataService) {}

    ngOnInit(): void {
        console.log('init dispatcher: metrics_data: ', this.metrics_data.myId);
    }

    ngOnDestroy(): void {
        console.log('destroy dispatcher');
    }
}
