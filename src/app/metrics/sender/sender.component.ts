import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MetricsDataService } from '../metrics-data.service';

@Component({
    selector: 'app-sender',
    templateUrl: './sender.component.html',
    styleUrls: ['./sender.component.scss'],
})
export class SenderComponent implements OnInit, OnDestroy {
    constructor(private _metricsData: MetricsDataService) {}

    private _metricsSubscription: Subscription;

    public currentMetricsStr: string;
    public currentId: number;

    ngOnInit(): void {
        console.log('init sender');
        this._metricsSubscription = this._metricsData.senderMetrics.subscribe((data) => {
            console.log(data);
            this.currentMetricsStr = JSON.stringify(data);
            this.currentId = data.data;
        });
    }

    ngOnDestroy(): void {
        console.log('destroy sender');
        this._metricsSubscription.unsubscribe();
        this._metricsSubscription = undefined;
    }
}
