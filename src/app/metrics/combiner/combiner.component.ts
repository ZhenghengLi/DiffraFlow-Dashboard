import { Component, OnInit, OnDestroy } from '@angular/core';
import { MetricsDataService } from '../metrics-data.service';
import { Subscription } from 'rxjs';
import { MetricsType, MetricsData } from '../metrics.common';

@Component({
    selector: 'app-combiner',
    templateUrl: './combiner.component.html',
    styleUrls: ['./combiner.component.scss'],
})
export class CombinerComponent implements OnInit, OnDestroy {
    constructor(private _metricsService: MetricsDataService) {}

    public metricsSubscription: Subscription;
    public selectedView: string = 'currentMetrics';

    public updateTime: Date;

    // metrics
    public metrics_Indexes: number[] = [];
    public metrics_DataArr: [string, any][] = [];
    public metrics_Object: any;

    // recvPacketRate
    public recvPacketRate_Indexes: number[] = [];
    public recvPacketRate_DataArr: [string, any][] = [];
    public recvPacketRate_Unit: string = '';
    public recvPacketRate_Object: any;

    // recvDataRate
    public recvDataRate_Indexes: number[] = [];
    public recvDataRate_DataArr: [string, any][] = [];
    public recvDataRate_Unit: string = '';
    public recvDataRate_Object: any;

    // maxFrameQueueSize
    public maxFrameQueueSize_Indexes: number[] = [];
    public maxFrameQueueSize_DataArr: [string, any][] = [];
    public maxFrameQueueSize_Unit: string = '';
    public maxFrameQueueSize_Object: any;

    // imageAlignmentRate
    public imageAlignmentRate_Indexes: number[] = [];
    public imageAlignmentRate_DataArr: [string, any][] = [];
    public imageAlignmentRate_Unit: string = '';
    public imageAlignmentRate_Object: any;

    // lateArrivingRate
    public lateArrivingRate_Indexes: number[] = [];
    public lateArrivingRate_DataArr: [string, any][] = [];
    public lateArrivingRate_Unit: string = '';
    public lateArrivingRate_Object: any;

    // partialImageRate
    public partialImageRate_Indexes: number[] = [];
    public partialImageRate_DataArr: [string, any][] = [];
    public partialImageRate_Unit: string = '';
    public partialImageRate_Object: any;

    // imageTakingRate
    public imageTakingRate_Indexes: number[] = [];
    public imageTakingRate_DataArr: [string, any][] = [];
    public imageTakingRate_Unit: string = '';
    public imageTakingRate_Object: any;

    // imageSendingRate
    public imageSendingRate_Indexes: number[] = [];
    public imageSendingRate_DataArr: [string, any][] = [];
    public imageSendingRate_Unit: string = '';
    public imageSendingRate_Object: any;

    private _update() {
        // check
        if (!this._metricsService.metricsGroup) return;
        if (this.updateTime && this.updateTime.getTime() >= this._metricsService.metricsGroup.updateTimestamp) return;

        // select data
        const data: MetricsData = this._metricsService.metricsGroup[MetricsType.combiner];
        this.updateTime = new Date(this._metricsService.metricsGroup.updateTimestamp);

        // metrics
        this.metrics_Object = data.metrics;
        this.metrics_DataArr = [];
        this.metrics_Indexes = [];
        for (let key in this.metrics_Object) {
            this.metrics_DataArr.push([key, this.metrics_Object[key]]);
        }
        this.metrics_Indexes = [...this.metrics_DataArr.keys()];

        // recvPacketRate
        this.recvPacketRate_DataArr = [];
        this.recvPacketRate_Indexes = [];
        if (data.selected.recvPacketRate) {
            this.recvPacketRate_Unit = data.selected.recvPacketRate.unit;
            this.recvPacketRate_Object = data.selected.recvPacketRate.data;
            for (let key in this.recvPacketRate_Object) {
                this.recvPacketRate_DataArr.push([key, this.recvPacketRate_Object[key]]);
            }
            this.recvPacketRate_Indexes = [...this.recvPacketRate_DataArr.keys()];
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

        // maxFrameQueueSize
        this.maxFrameQueueSize_DataArr = [];
        this.maxFrameQueueSize_Indexes = [];
        if (data.selected.maxFrameQueueSize) {
            this.maxFrameQueueSize_Unit = data.selected.maxFrameQueueSize.unit;
            this.maxFrameQueueSize_Object = data.selected.maxFrameQueueSize.data;
            for (let key in this.maxFrameQueueSize_Object) {
                this.maxFrameQueueSize_DataArr.push([key, this.maxFrameQueueSize_Object[key]]);
            }
            this.maxFrameQueueSize_Indexes = [...this.maxFrameQueueSize_DataArr.keys()];
        }

        // imageAlignmentRate
        this.imageAlignmentRate_DataArr = [];
        this.imageAlignmentRate_Indexes = [];
        if (data.selected.imageAlignmentRate) {
            this.imageAlignmentRate_Unit = data.selected.imageAlignmentRate.unit;
            this.imageAlignmentRate_Object = data.selected.imageAlignmentRate.data;
            for (let key in this.imageAlignmentRate_Object) {
                this.imageAlignmentRate_DataArr.push([key, this.imageAlignmentRate_Object[key]]);
            }
            this.imageAlignmentRate_Indexes = [...this.imageAlignmentRate_DataArr.keys()];
        }

        // lateArrivingRate
        this.lateArrivingRate_DataArr = [];
        this.lateArrivingRate_Indexes = [];
        if (data.selected.lateArrivingRate) {
            this.lateArrivingRate_Unit = data.selected.lateArrivingRate.unit;
            this.lateArrivingRate_Object = data.selected.lateArrivingRate.data;
            for (let key in this.lateArrivingRate_Object) {
                this.lateArrivingRate_DataArr.push([key, this.lateArrivingRate_Object[key]]);
            }
            this.lateArrivingRate_Indexes = [...this.lateArrivingRate_DataArr.keys()];
        }

        // partialImageRate
        this.partialImageRate_DataArr = [];
        this.partialImageRate_Indexes = [];
        if (data.selected.partialImageRate) {
            this.partialImageRate_Unit = data.selected.partialImageRate.unit;
            this.partialImageRate_Object = data.selected.partialImageRate.data;
            for (let key in this.partialImageRate_Object) {
                this.partialImageRate_DataArr.push([key, this.partialImageRate_Object[key]]);
            }
            this.partialImageRate_Indexes = [...this.partialImageRate_DataArr.keys()];
        }

        // imageTakingRate
        this.imageTakingRate_DataArr = [];
        this.imageTakingRate_Indexes = [];
        if (data.selected.imageTakingRate) {
            this.imageTakingRate_Unit = data.selected.imageTakingRate.unit;
            this.imageTakingRate_Object = data.selected.imageTakingRate.data;
            for (let key in this.imageTakingRate_Object) {
                this.imageTakingRate_DataArr.push([key, this.imageTakingRate_Object[key]]);
            }
            this.imageTakingRate_Indexes = [...this.imageTakingRate_DataArr.keys()];
        }

        // imageSendingRate
        this.imageSendingRate_DataArr = [];
        this.imageSendingRate_Indexes = [];
        if (data.selected.imageSendingRate) {
            this.imageSendingRate_Unit = data.selected.imageSendingRate.unit;
            this.imageSendingRate_Object = data.selected.imageSendingRate.data;
            for (let key in this.imageSendingRate_Object) {
                this.imageSendingRate_DataArr.push([key, this.imageSendingRate_Object[key]]);
            }
            this.imageSendingRate_Indexes = [...this.imageSendingRate_DataArr.keys()];
        }
    }

    ngOnInit(): void {
        console.log('init combiner');
        this._update();
        this.metricsSubscription = this._metricsService.metricsNotifier.subscribe(() => {
            this._update();
        });
        this.listening = this._metricsService.listening;
    }

    ngOnDestroy(): void {
        console.log('destroy combiner');
        if (this.metricsSubscription) {
            this.metricsSubscription.unsubscribe();
            this.metricsSubscription = undefined;
        }
    }

    listening: boolean = false;

    resume(): void {
        this._metricsService.listen();
        this.listening = this._metricsService.listening;
    }

    pause(): void {
        this._metricsService.unlisten();
        this.listening = this._metricsService.listening;
    }
}
