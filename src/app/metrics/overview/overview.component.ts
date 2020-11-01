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
    constructor(private _metricsService: MetricsDataService) {}

    public metricsSubscription: Subscription;
    public selectedView: string = 'summaryTable';

    public updateTime: Date;

    tcpRecvPacketCount: number = 0;
    tcpRecvPacketRate_Last: number = 0;
    tcpRecvPacketRate_Data: [number, number][] = [];
    tcpRecvPacketRate_Unit: string = '';

    tcpRecvDataSize: number = 0;
    tcpRecvDataRate_Last: number = 0;
    tcpRecvDataRate_Data: [number, number][] = [];
    tcpRecvDataRate_Unit: string = '';

    udpRecvPacketCount: number = 0;
    udpRecvPacketRate_Last: number = 0;
    udpRecvPacketRate_Data: [number, number][] = [];
    udpRecvPacketRate_Unit: string = '';

    udpRecvDataSize: number = 0;
    udpRecvDataRate_Last: number = 0;
    udpRecvDataRate_Data: [number, number][] = [];
    udpRecvDataRate_Unit: string = '';

    udpFrameCountChecked: number = 0;
    udpFrameRateChecked_Last: number = 0;
    udpFrameRateChecked_Data: [number, number][] = [];
    udpFrameRateChecked_Unit: string = '';

    udpFrameCountAll: number = 0;
    udpFrameRateAll_Last: number = 0;
    udpFrameRateAll_Data: [number, number][] = [];
    udpFrameRateAll_Unit: string = '';

    imageAlignmentCount: number = 0;
    imageAlignmentRate_Last: number = 0;
    imageAlignmentRate_Data: [number, number][] = [];
    imageAlignmentRate_Unit: string = '';

    partialImageCount: number = 0;
    partialImageRate_Last: number = 0;
    partialImageRate_Data: [number, number][] = [];
    partialImageRate_Unit: string = '';

    lateArrivingCount: number = 0;
    lateArrivingRate_Last: number = 0;
    lateArrivingRate_Data: [number, number][] = [];
    lateArrivingRate_Unit: string = '';

    maxFrameQueueSize: number = 0;
    maxFrameQueueSize_Data: [number, number][] = [];
    maxFrameQueueSize_Unit: string = '';

    processedImageCount: number = 0;
    processedImageRate_Last: number = 0;
    processedImageRate_Data: [number, number][] = [];
    processedImageRate_Unit: string = '';

    monitoringImageCount: number = 0;
    monitoringImageRate_Last: number = 0;
    monitoringImageRate_Data: [number, number][] = [];
    monitoringImageRate_Unit: string = '';

    savingImageCount: number = 0;
    savingImageRate_Last: number = 0;
    savingImageRate_Data: [number, number][] = [];
    savingImageRate_Unit: string = '';

    savedImageCount: number = 0;
    savedImageRate_Last: number = 0;
    savedImageRate_Data: [number, number][] = [];
    savedImageRate_Unit: string = '';

    imageRequestCount: number = 0;
    imageRequestRate_Last: number = 0;
    imageRequestRate_Data: [number, number][] = [];
    imageRequestRate_Unit: string = '';

    imageSendCount: number = 0;
    imageSendRate_Last: number = 0;
    imageSendRate_Data: [number, number][] = [];
    imageSendRate_Unit: string = '';

    private _update() {
        // check
        if (!this._metricsService.metricsGroup) return;
        if (this.updateTime && this.updateTime.getTime() >= this._metricsService.metricsGroup.updateTimestamp) return;

        // select data
        const data: MetricsOverview = this._metricsService.metricsGroup[MetricsType.overview];
        this.updateTime = new Date(this._metricsService.metricsGroup.updateTimestamp);

        // copy data
        this.tcpRecvPacketCount = data.aggregated.tcpRecvPacketCount;
        this.tcpRecvPacketRate_Unit = data.history.tcpRecvPacketRate.unit;
        this.tcpRecvPacketRate_Data = data.history.tcpRecvPacketRate.data;
        if (this.tcpRecvPacketRate_Data.length > 0) {
            this.tcpRecvPacketRate_Last = this.tcpRecvPacketRate_Data.slice(-1)[0][1];
        }

        this.tcpRecvDataSize = data.aggregated.tcpRecvDataSize;
        this.tcpRecvDataRate_Unit = data.history.tcpRecvDataRate.unit;
        this.tcpRecvDataRate_Data = data.history.tcpRecvDataRate.data;
        if (this.tcpRecvDataRate_Data.length > 0) {
            this.tcpRecvDataRate_Last = this.tcpRecvDataRate_Data.slice(-1)[0][1];
        }

        this.udpRecvPacketCount = data.aggregated.udpRecvPacketCount;
        this.udpRecvPacketRate_Unit = data.history.udpRecvPacketRate.unit;
        this.udpRecvPacketRate_Data = data.history.udpRecvPacketRate.data;
        if (this.udpRecvPacketRate_Data.length > 0) {
            this.udpRecvPacketRate_Last = this.udpRecvPacketRate_Data.slice(-1)[0][1];
        }

        this.udpRecvDataSize = data.aggregated.udpRecvDataSize;
        this.udpRecvDataRate_Unit = data.history.udpRecvDataRate.unit;
        this.udpRecvDataRate_Data = data.history.udpRecvDataRate.data;
        if (this.udpRecvDataRate_Data.length > 0) {
            this.udpRecvDataRate_Last = this.udpRecvDataRate_Data.slice(-1)[0][1];
        }

        this.udpFrameCountChecked = data.aggregated.udpFrameCountChecked;
        this.udpFrameRateChecked_Unit = data.history.udpFrameRateChecked.unit;
        this.udpFrameRateChecked_Data = data.history.udpFrameRateChecked.data;
        if (this.udpFrameRateChecked_Data.length > 0) {
            this.udpFrameRateChecked_Last = this.udpFrameRateChecked_Data.slice(-1)[0][1];
        }

        this.udpFrameCountAll = data.aggregated.udpFrameCountAll;
        this.udpFrameRateAll_Unit = data.history.udpFrameRateAll.unit;
        this.udpFrameRateAll_Data = data.history.udpFrameRateAll.data;
        if (this.udpFrameRateAll_Data.length > 0) {
            this.udpFrameRateAll_Last = this.udpFrameRateAll_Data.slice(-1)[0][1];
        }

        this.imageAlignmentCount = data.aggregated.imageAlignmentCount;
        this.imageAlignmentRate_Unit = data.history.imageAlignmentRate.unit;
        this.imageAlignmentRate_Data = data.history.imageAlignmentRate.data;
        if (this.imageAlignmentRate_Data.length > 0) {
            this.imageAlignmentRate_Last = this.imageAlignmentRate_Data.slice(-1)[0][1];
        }

        this.partialImageCount = data.aggregated.partialImageCount;
        this.partialImageRate_Unit = data.history.partialImageRate.unit;
        this.partialImageRate_Data = data.history.partialImageRate.data;
        if (this.partialImageRate_Data.length > 0) {
            this.partialImageRate_Last = this.partialImageRate_Data.slice(-1)[0][1];
        }

        this.lateArrivingCount = data.aggregated.lateArrivingCount;
        this.lateArrivingRate_Unit = data.history.lateArrivingRate.unit;
        this.lateArrivingRate_Data = data.history.lateArrivingRate.data;
        if (this.lateArrivingRate_Data.length > 0) {
            this.lateArrivingRate_Last = this.lateArrivingRate_Data.slice(-1)[0][1];
        }

        this.maxFrameQueueSize = data.aggregated.maxFrameQueueSize;
        this.maxFrameQueueSize_Unit = data.history.maxFrameQueueSize.unit;
        this.maxFrameQueueSize_Data = data.history.maxFrameQueueSize.data;

        this.processedImageCount = data.aggregated.processedImageCount;
        this.processedImageRate_Unit = data.history.processedImageRate.unit;
        this.processedImageRate_Data = data.history.processedImageRate.data;
        if (this.processedImageRate_Data.length > 0) {
            this.processedImageRate_Last = this.processedImageRate_Data.slice(-1)[0][1];
        }

        this.monitoringImageCount = data.aggregated.monitoringImageCount;
        this.monitoringImageRate_Unit = data.history.monitoringImageRate.unit;
        this.monitoringImageRate_Data = data.history.monitoringImageRate.data;
        if (this.monitoringImageRate_Data.length > 0) {
            this.monitoringImageRate_Last = this.monitoringImageRate_Data.slice(-1)[0][1];
        }

        this.savingImageCount = data.aggregated.savingImageCount;
        this.savingImageRate_Unit = data.history.savingImageRate.unit;
        this.savingImageRate_Data = data.history.savingImageRate.data;
        if (this.savingImageRate_Data.length > 0) {
            this.savingImageRate_Last = this.savingImageRate_Data.slice(-1)[0][1];
        }

        this.savedImageCount = data.aggregated.savedImageCount;
        this.savedImageRate_Unit = data.history.savedImageRate.unit;
        this.savedImageRate_Data = data.history.savedImageRate.data;
        if (this.savedImageRate_Data.length > 0) {
            this.savedImageRate_Last = this.savedImageRate_Data.slice(-1)[0][1];
        }

        this.imageRequestCount = data.aggregated.imageRequestCount;
        this.imageRequestRate_Unit = data.history.imageRequestRate.unit;
        this.imageRequestRate_Data = data.history.imageRequestRate.data;
        if (this.imageRequestRate_Data.length > 0) {
            this.imageRequestRate_Last = this.imageRequestRate_Data.slice(-1)[0][1];
        }

        this.imageSendCount = data.aggregated.imageSendCount;
        this.imageSendRate_Unit = data.history.imageSendRate.unit;
        this.imageSendRate_Data = data.history.imageSendRate.data;
        if (this.imageSendRate_Data.length > 0) {
            this.imageSendRate_Last = this.imageSendRate_Data.slice(-1)[0][1];
        }
    }

    ngOnInit(): void {
        console.log('init overview');
        this._update();
        this.metricsSubscription = this._metricsService.metricsNotifier.subscribe(() => {
            this._update();
        });
        this.listening = this._metricsService.listening;
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
        this._metricsService.listen();
        this.listening = this._metricsService.listening;
    }

    pause(): void {
        this._metricsService.unlisten();
        this.listening = this._metricsService.listening;
    }
}
