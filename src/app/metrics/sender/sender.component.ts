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
    public dataRate_Indexes: number[] = [];
    public dataRate_DataArr: [string, any][] = [];
    public dataRate_Unit: string = '';
    public dataRate_Object: any;

    // otherParameter

    private _update(data: MetricsData) {
        // check type
        if (data.type !== MetricsType.sender) return;

        this.updateTime = new Date();

        this.metricsObject = data.metrics;

        // dataRate
        this.dataRate_DataArr = [];
        this.dataRate_Indexes = [];
        if (data.selected.dataRate) {
            this.dataRate_Unit = data.selected.dataRate.unit;
            this.dataRate_Object = data.selected.dataRate.data;
            for (let key in this.dataRate_Object) {
                this.dataRate_DataArr.push([key, this.dataRate_Object[key]]);
            }
            this.dataRate_Indexes = [...this.dataRate_DataArr.keys()];
        }

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
