import { Component, OnInit, OnDestroy } from '@angular/core';
import { MetricsDataService } from '../metrics-data.service';
import { Subscription } from 'rxjs';
import { MetricsType, MetricsData, MetricsOverview } from '../metrics.common';

@Component({
    selector: 'app-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit, OnDestroy {
    constructor(private metricsService: MetricsDataService) {}

    public metricsSubscription: Subscription;
    public selectedView: string = 'currentMetrics';

    public updateTime: Date;

    // metrics
    public metrics_Object: any;

    private _update() {
        // check
        if (!this.metricsService.metricsGroup) return;
        if (this.updateTime && this.updateTime.getTime() >= this.metricsService.metricsGroup.updateTimestamp) return;

        // select data
        const data: MetricsOverview = this.metricsService.metricsGroup[MetricsType.overview];
        this.updateTime = new Date(this.metricsService.metricsGroup.updateTimestamp);

        // metrics
        this.metrics_Object = data;

        console.log(this.metrics_Object);
    }

    ngOnInit(): void {
        console.log('init overview');
        this._update();
        this.metricsSubscription = this.metricsService.metricsNotifier.subscribe(() => {
            this._update();
        });
        this.listening = this.metricsService.listening;
    }

    ngOnDestroy(): void {
        console.log('destroy overview');
        if (this.metricsSubscription) {
            this.metricsSubscription.unsubscribe();
            this.metricsSubscription = undefined;
        }
    }

    listening: boolean = false;

    resume(): void {
        this.metricsService.listen();
        this.listening = this.metricsService.listening;
    }

    pause(): void {
        this.metricsService.unlisten();
        this.listening = this.metricsService.listening;
    }
}
