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
    constructor(public metricsService: MetricsDataService) {}

    public metricsSubscription: Subscription;
    public selectedView: string = 'currentMetrics';

    public updateTime: Date;

    // metrics
    public metrics_Indexes: number[] = [];
    public metrics_DataArr: [string, any][] = [];
    public metrics_Object: any;

    // imageRequestRate
    public imageRequestRate_Indexes: number[] = [];
    public imageRequestRate_DataArr: [string, any][] = [];
    public imageRequestRate_Unit: string = '';
    public imageRequestRate_Object: any;

    // imageSendRate
    public imageSendRate_Indexes: number[] = [];
    public imageSendRate_DataArr: [string, any][] = [];
    public imageSendRate_Unit: string = '';
    public imageSendRate_Object: any;

    private _update() {
        // check
        if (!this.metricsService.metricsGroup) return;
        if (this.updateTime && this.updateTime.getTime() >= this.metricsService.metricsGroup.updateTimestamp) return;

        // select data
        const data: MetricsData = this.metricsService.metricsGroup[MetricsType.controller];
        this.updateTime = new Date(this.metricsService.metricsGroup.updateTimestamp);

        // metrics
        this.metrics_Object = data.metrics;
        this.metrics_DataArr = [];
        this.metrics_Indexes = [];
        for (let key in this.metrics_Object) {
            this.metrics_DataArr.push([key, this.metrics_Object[key]]);
        }
        this.metrics_Indexes = [...this.metrics_DataArr.keys()];

        // imageRequestRate
        this.imageRequestRate_DataArr = [];
        this.imageRequestRate_Indexes = [];
        if (data.selected.imageRequestRate) {
            this.imageRequestRate_Unit = data.selected.imageRequestRate.unit;
            this.imageRequestRate_Object = data.selected.imageRequestRate.data;
            for (let key in this.imageRequestRate_Object) {
                this.imageRequestRate_DataArr.push([key, this.imageRequestRate_Object[key]]);
            }
            this.imageRequestRate_Indexes = [...this.imageRequestRate_DataArr.keys()];
        }

        // imageSendRate
        this.imageSendRate_DataArr = [];
        this.imageSendRate_Indexes = [];
        if (data.selected.imageSendRate) {
            this.imageSendRate_Unit = data.selected.imageSendRate.unit;
            this.imageSendRate_Object = data.selected.imageSendRate.data;
            for (let key in this.imageSendRate_Object) {
                this.imageSendRate_DataArr.push([key, this.imageSendRate_Object[key]]);
            }
            this.imageSendRate_Indexes = [...this.imageSendRate_DataArr.keys()];
        }
    }

    ngOnInit(): void {
        console.log('init controller');
        this._update();
        this.metricsSubscription = this.metricsService.metricsNotifier.subscribe(() => {
            this._update();
        });
        this.listening = this.metricsService.listening;
    }

    ngOnDestroy(): void {
        console.log('destroy controller');
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
