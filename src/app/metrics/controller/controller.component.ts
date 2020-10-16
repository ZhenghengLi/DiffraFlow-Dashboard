import { Component, OnInit, OnDestroy } from '@angular/core';
import { MetricsDataService } from '../metrics-data.service';

@Component({
    selector: 'app-controller',
    templateUrl: './controller.component.html',
    styleUrls: ['./controller.component.scss'],
})
export class ControllerComponent implements OnInit, OnDestroy {
    constructor(private metrics_data: MetricsDataService) {}

    ngOnInit(): void {
        console.log('init controller: metrics_data: ', this.metrics_data.myId);
    }

    ngOnDestroy(): void {
        console.log('destroy controller');
    }
}
