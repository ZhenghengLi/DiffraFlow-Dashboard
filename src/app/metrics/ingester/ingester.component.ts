import { Component, OnInit, OnDestroy } from '@angular/core';
import { MetricsDataService } from '../metrics-data.service';
import { Subscription } from 'rxjs';
import { MetricsType, MetricsData } from '../metrics.common';

@Component({
    selector: 'app-ingester',
    templateUrl: './ingester.component.html',
    styleUrls: ['./ingester.component.scss'],
})
export class IngesterComponent implements OnInit, OnDestroy {
    constructor(private _metricsService: MetricsDataService) {}

    public metricsSubscription: Subscription;
    public selectedView: string = 'currentMetrics';

    public updateTime: Date;

    // metrics
    public metrics_Indexes: number[] = [];
    public metrics_DataArr: [string, any][] = [];
    public metrics_Object: any;

    // recvImageRate
    public recvImageRate_Indexes: number[] = [];
    public recvImageRate_DataArr: [string, any][] = [];
    public recvImageRate_Unit: string = '';
    public recvImageRate_Object: any;

    // recvDataRate
    public recvDataRate_Indexes: number[] = [];
    public recvDataRate_DataArr: [string, any][] = [];
    public recvDataRate_Unit: string = '';
    public recvDataRate_Object: any;

    // processedImageRate
    public processedImageRate_Indexes: number[] = [];
    public processedImageRate_DataArr: [string, any][] = [];
    public processedImageRate_Unit: string = '';
    public processedImageRate_Object: any;

    // monitoringImageRate
    public monitoringImageRate_Indexes: number[] = [];
    public monitoringImageRate_DataArr: [string, any][] = [];
    public monitoringImageRate_Unit: string = '';
    public monitoringImageRate_Object: any;

    // savingImageRate
    public savingImageRate_Indexes: number[] = [];
    public savingImageRate_DataArr: [string, any][] = [];
    public savingImageRate_Unit: string = '';
    public savingImageRate_Object: any;

    // savedImageRate
    public savedImageRate_Indexes: number[] = [];
    public savedImageRate_DataArr: [string, any][] = [];
    public savedImageRate_Unit: string = '';
    public savedImageRate_Object: any;

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

    private _update(data: MetricsData) {
        // check type
        if (data.type !== MetricsType.ingester) return;

        this.updateTime = new Date();

        // metrics
        this.metrics_Object = data.metrics;
        this.metrics_DataArr = [];
        this.metrics_Indexes = [];
        for (let key in this.metrics_Object) {
            this.metrics_DataArr.push([key, this.metrics_Object[key]]);
        }
        this.metrics_Indexes = [...this.metrics_DataArr.keys()];

        // recvImageRate
        this.recvImageRate_DataArr = [];
        this.recvImageRate_Indexes = [];
        if (data.selected.recvImageRate) {
            this.recvImageRate_Unit = data.selected.recvImageRate.unit;
            this.recvImageRate_Object = data.selected.recvImageRate.data;
            for (let key in this.recvImageRate_Object) {
                this.recvImageRate_DataArr.push([key, this.recvImageRate_Object[key]]);
            }
            this.recvImageRate_Indexes = [...this.recvImageRate_DataArr.keys()];
        }

        // recvDataRate
        this.recvDataRate_DataArr = [];
        this.recvDataRate_Indexes = [];
        if (data.selected.recvDataRate) {
            this.recvDataRate_Unit = data.selected.recvDataRate.unit;
            this.recvDataRate_Object = data.selected.recvDataRate.data;
            for (let key in this.recvDataRate_Object) {
                this.recvDataRate_DataArr.push([key, this.recvDataRate_Object[key]]);
            }
            this.recvDataRate_Indexes = [...this.recvDataRate_DataArr.keys()];
        }

        // processedImageRate
        this.processedImageRate_DataArr = [];
        this.processedImageRate_Indexes = [];
        if (data.selected.processedImageRate) {
            this.processedImageRate_Unit = data.selected.processedImageRate.unit;
            this.processedImageRate_Object = data.selected.processedImageRate.data;
            for (let key in this.processedImageRate_Object) {
                this.processedImageRate_DataArr.push([key, this.processedImageRate_Object[key]]);
            }
            this.processedImageRate_Indexes = [...this.processedImageRate_DataArr.keys()];
        }

        // monitoringImageRate
        this.monitoringImageRate_DataArr = [];
        this.monitoringImageRate_Indexes = [];
        if (data.selected.monitoringImageRate) {
            this.monitoringImageRate_Unit = data.selected.monitoringImageRate.unit;
            this.monitoringImageRate_Object = data.selected.monitoringImageRate.data;
            for (let key in this.monitoringImageRate_Object) {
                this.monitoringImageRate_DataArr.push([key, this.monitoringImageRate_Object[key]]);
            }
            this.monitoringImageRate_Indexes = [...this.monitoringImageRate_DataArr.keys()];
        }

        // savingImageRate
        this.savingImageRate_DataArr = [];
        this.savingImageRate_Indexes = [];
        if (data.selected.savingImageRate) {
            this.savingImageRate_Unit = data.selected.savingImageRate.unit;
            this.savingImageRate_Object = data.selected.savingImageRate.data;
            for (let key in this.savingImageRate_Object) {
                this.savingImageRate_DataArr.push([key, this.savingImageRate_Object[key]]);
            }
            this.savingImageRate_Indexes = [...this.savingImageRate_DataArr.keys()];
        }

        // savedImageRate
        this.savedImageRate_DataArr = [];
        this.savedImageRate_Indexes = [];
        if (data.selected.savedImageRate) {
            this.savedImageRate_Unit = data.selected.savedImageRate.unit;
            this.savedImageRate_Object = data.selected.savedImageRate.data;
            for (let key in this.savedImageRate_Object) {
                this.savedImageRate_DataArr.push([key, this.savedImageRate_Object[key]]);
            }
            this.savedImageRate_Indexes = [...this.savedImageRate_DataArr.keys()];
        }

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
        console.log('init ingester');
        this._metricsService.select(MetricsType.ingester);
        this.resume();
    }

    ngOnDestroy(): void {
        console.log('destroy ingester');
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
