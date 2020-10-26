import { Component, OnInit, OnDestroy } from '@angular/core';
import { MetricsDataService } from '../metrics-data.service';
import { Subscription } from 'rxjs';
import { MetricsType, MetricsData } from '../metrics.common';

@Component({
    selector: 'app-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit, OnDestroy {
    constructor(private _metricsService: MetricsDataService) {}

    public metricsSubscription: Subscription;
    public selectedView: string = 'currentMetrics';

    public updateTime: Date;

    // metrics
    public metrics_Object: any;

    private _update(data: MetricsData) {
        // check type
        if (data.type !== MetricsType.overview) return;

        this.updateTime = new Date();

        // metrics
        this.metrics_Object = JSON.stringify(data.metrics);

        console.log(this.metrics_Object);
    }

    ngOnInit(): void {
        console.log('init overview');
        this._metricsService.select(MetricsType.overview);
        this.resume();
    }

    ngOnDestroy(): void {
        console.log('destroy overview');
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
