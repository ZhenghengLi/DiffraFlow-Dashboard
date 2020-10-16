import { Component, OnInit, OnDestroy } from '@angular/core';
import { MetricsDataService } from '../metrics-data.service';

@Component({
    selector: 'app-sender',
    templateUrl: './sender.component.html',
    styleUrls: ['./sender.component.scss'],
})
export class SenderComponent implements OnInit, OnDestroy {
    constructor(private _metricsData: MetricsDataService) {}

    ngOnInit(): void {
        console.log('init sender');
    }

    ngOnDestroy(): void {
        console.log('destroy sender');
    }
}
