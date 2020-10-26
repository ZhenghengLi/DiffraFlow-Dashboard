import { Component, OnInit, OnDestroy } from '@angular/core';
import { MetricsDataService } from '../metrics-data.service';
import { Subscription } from 'rxjs';
import { MetricsType, MetricsData } from '../metrics.common';

@Component({
    selector: 'app-controller',
    templateUrl: './controller.component.html',
    styleUrls: ['./controller.component.scss'],
})
export class ControllerComponent implements OnInit, OnDestroy {
    constructor(private _metricsService: MetricsDataService) {}

    public metricsSubscription: Subscription;
    public selectedView: string = 'currentMetrics';

    public updateTime: Date;

    // metrics
    public metrics_Indexes: number[] = [];
    public metrics_DataArr: [string, any][] = [];
    public metrics_Object: any;

    private _update(data: MetricsData) {
        // check type
        if (data.type !== MetricsType.controller) return;

        this.updateTime = new Date();

        // metrics
        this.metrics_Object = data.metrics;
        this.metrics_DataArr = [];
        this.metrics_Indexes = [];
        for (let key in this.metrics_Object) {
            this.metrics_DataArr.push([key, this.metrics_Object[key]]);
        }
        this.metrics_Indexes = [...this.metrics_DataArr.keys()];
    }

    ngOnInit(): void {
        console.log('init controller');
        this._metricsService.select(MetricsType.controller);
        this.resume();
    }

    ngOnDestroy(): void {
        console.log('destroy controller');
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
