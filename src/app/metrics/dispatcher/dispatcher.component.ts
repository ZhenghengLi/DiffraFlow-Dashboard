import { Component, OnInit, OnDestroy } from '@angular/core';
import { MetricsDataService } from '../metrics-data.service';
import { Subscription } from 'rxjs';
import { MetricsType, MetricsData } from '../metrics.common';

@Component({
    selector: 'app-dispatcher',
    templateUrl: './dispatcher.component.html',
    styleUrls: ['./dispatcher.component.scss'],
})
export class DispatcherComponent implements OnInit, OnDestroy {
    constructor(private _metricsService: MetricsDataService) {}

    public metricsSubscription: Subscription;
    public selectedView: string = 'currentMetrics';

    public updateTime: Date;

    // metrics
    public metrics_Indexes: number[] = [];
    public metrics_DataArr: [string, any][] = [];
    public metrics_Object: any;

    // udpPacketRate
    public udpPacketRate_Indexes: number[] = [];
    public udpPacketRate_DataArr: [string, any][] = [];
    public udpPacketRate_Unit: string = '';
    public udpPacketRate_Object: any;

    // udpDataRate
    public udpDataRate_Indexes: number[] = [];
    public udpDataRate_DataArr: [string, any][] = [];
    public udpDataRate_Unit: string = '';
    public udpDataRate_Object: any;

    // udpFrameRateChecked
    public udpFrameRateChecked_Indexes: number[] = [];
    public udpFrameRateChecked_DataArr: [string, any][] = [];
    public udpFrameRateChecked_Unit: string = '';
    public udpFrameRateChecked_Object: any;

    // udpFrameRateAll
    public udpFrameRateAll_Indexes: number[] = [];
    public udpFrameRateAll_DataArr: [string, any][] = [];
    public udpFrameRateAll_Unit: string = '';
    public udpFrameRateAll_Object: any;

    // tcpPacketRate
    public tcpPacketRate_Indexes: number[] = [];
    public tcpPacketRate_DataArr: [string, any][] = [];
    public tcpPacketRate_Unit: string = '';
    public tcpPacketRate_Object: any;

    // tcpDataRate
    public tcpDataRate_Indexes: number[] = [];
    public tcpDataRate_DataArr: [string, any][] = [];
    public tcpDataRate_Unit: string = '';
    public tcpDataRate_Object: any;

    private _update(data: MetricsData) {
        // check type
        if (data.type !== MetricsType.dispatcher) return;

        this.updateTime = new Date();

        // metrics
        this.metrics_Object = data.metrics;
        this.metrics_DataArr = [];
        this.metrics_Indexes = [];
        for (let key in this.metrics_Object) {
            this.metrics_DataArr.push([key, this.metrics_Object[key]]);
        }
        this.metrics_Indexes = [...this.metrics_DataArr.keys()];

        // udpPacketRate
        this.udpPacketRate_DataArr = [];
        this.udpPacketRate_Indexes = [];
        if (data.selected.udpPacketRate) {
            this.udpPacketRate_Unit = data.selected.udpPacketRate.unit;
            this.udpPacketRate_Object = data.selected.udpPacketRate.data;
            for (let key in this.udpPacketRate_Object) {
                this.udpPacketRate_DataArr.push([key, this.udpPacketRate_Object[key]]);
            }
            this.udpPacketRate_Indexes = [...this.udpPacketRate_DataArr.keys()];
        }

        // udpDataRate
        this.udpDataRate_DataArr = [];
        this.udpDataRate_Indexes = [];
        if (data.selected.udpDataRate) {
            this.udpDataRate_Unit = data.selected.udpDataRate.unit;
            this.udpDataRate_Object = data.selected.udpDataRate.data;
            for (let key in this.udpDataRate_Object) {
                this.udpDataRate_DataArr.push([key, this.udpDataRate_Object[key]]);
            }
            this.udpDataRate_Indexes = [...this.udpDataRate_DataArr.keys()];
        }

        // udpFrameRateChecked
        this.udpFrameRateChecked_DataArr = [];
        this.udpFrameRateChecked_Indexes = [];
        if (data.selected.udpFrameRateChecked) {
            this.udpFrameRateChecked_Unit = data.selected.udpFrameRateChecked.unit;
            this.udpFrameRateChecked_Object = data.selected.udpFrameRateChecked.data;
            for (let key in this.udpFrameRateChecked_Object) {
                this.udpFrameRateChecked_DataArr.push([key, this.udpFrameRateChecked_Object[key]]);
            }
            this.udpFrameRateChecked_Indexes = [...this.udpFrameRateChecked_DataArr.keys()];
        }

        // udpFrameRateAll
        this.udpFrameRateAll_DataArr = [];
        this.udpFrameRateAll_Indexes = [];
        if (data.selected.udpFrameRateAll) {
            this.udpFrameRateAll_Unit = data.selected.udpFrameRateAll.unit;
            this.udpFrameRateAll_Object = data.selected.udpFrameRateAll.data;
            for (let key in this.udpFrameRateAll_Object) {
                this.udpFrameRateAll_DataArr.push([key, this.udpFrameRateAll_Object[key]]);
            }
            this.udpFrameRateAll_Indexes = [...this.udpFrameRateAll_DataArr.keys()];
        }

        // tcpPacketRate
        this.tcpPacketRate_DataArr = [];
        this.tcpPacketRate_Indexes = [];
        if (data.selected.tcpPacketRate) {
            this.tcpPacketRate_Unit = data.selected.tcpPacketRate.unit;
            this.tcpPacketRate_Object = data.selected.tcpPacketRate.data;
            for (let key in this.tcpPacketRate_Object) {
                this.tcpPacketRate_DataArr.push([key, this.tcpPacketRate_Object[key]]);
            }
            this.tcpPacketRate_Indexes = [...this.tcpPacketRate_DataArr.keys()];
        }

        // tcpDataRate
        this.tcpDataRate_DataArr = [];
        this.tcpDataRate_Indexes = [];
        if (data.selected.udpDataRate) {
            this.tcpDataRate_Unit = data.selected.tcpDataRate.unit;
            this.tcpDataRate_Object = data.selected.tcpDataRate.data;
            for (let key in this.tcpDataRate_Object) {
                this.tcpDataRate_DataArr.push([key, this.tcpDataRate_Object[key]]);
            }
            this.tcpDataRate_Indexes = [...this.tcpDataRate_DataArr.keys()];
        }
    }

    ngOnInit(): void {
        console.log('init dispatcher');
        this._metricsService.select(MetricsType.dispatcher);
        this.resume();
    }

    ngOnDestroy(): void {
        console.log('destroy dispatcher');
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
