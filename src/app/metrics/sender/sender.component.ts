import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MetricsDataService } from '../metrics-data.service';
import { MetricsType, MetricsData } from '../metrics.common';

@Component({
    selector: 'app-sender',
    templateUrl: './sender.component.html',
    styleUrls: ['./sender.component.scss'],
})
export class SenderComponent implements OnInit, OnDestroy {
    constructor(private _metricsService: MetricsDataService) {}

    public metricsSubscription: Subscription;
    public selectedView: string = 'currentMetrics';

    public updateTime: Date;

    public metricsObject: any;

    // dataRate
    public dataRateIndexes: number[] = [];
    public dataRateDataArr: [string, any][] = [];
    public dataRateUnit: string = '';
    public dataRateObject: any;

    // otherParameter

    private _update(data: MetricsData) {
        // check type
        if (data.type !== MetricsType.sender) return;

        this.updateTime = new Date();

        this.metricsObject = data.metrics;

        // dataRate
        this.dataRateUnit = data.selected.dataRate.unit;
        this.dataRateObject = data.selected.dataRate.data;
        this.dataRateDataArr = [];
        for (let key in this.dataRateObject) {
            this.dataRateDataArr.push([key, this.dataRateObject[key]]);
        }
        this.dataRateIndexes = [...this.dataRateDataArr.keys()];

        // otherParameter
    }

    ngOnInit(): void {
        console.log('init sender');
        this._metricsService.select(MetricsType.sender);
        this.resume();
    }

    ngOnDestroy(): void {
        console.log('destroy sender');
        this._metricsService.unselect();
    }

    resume(): void {
        if (!this.metricsSubscription) {
            this.metricsSubscription = this._metricsService.metricsNotifier.subscribe((data) => this._update(data));
        }
    }

    pause(): void {
        if (this.metricsSubscription) {
            this.metricsSubscription.unsubscribe();
            this.metricsSubscription = undefined;
        }
    }
}
