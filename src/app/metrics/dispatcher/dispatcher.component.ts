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
    constructor(public metricsService: MetricsDataService) {}

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

    // sendPacketRate
    public sendPacketRate_Indexes: number[] = [];
    public sendPacketRate_DataArr: [string, any][] = [];
    public sendPacketRate_Unit: string = '';
    public sendPacketRate_Object: any;

    // sendDataRate
    public sendDataRate_Indexes: number[] = [];
    public sendDataRate_DataArr: [string, any][] = [];
    public sendDataRate_Unit: string = '';
    public sendDataRate_Object: any;

    private _update() {
        // check
        if (!this.metricsService.metricsGroup) return;
        if (this.updateTime && this.updateTime.getTime() >= this.metricsService.metricsGroup.updateTimestamp) return;

        // select data
        const data: MetricsData = this.metricsService.metricsGroup[MetricsType.dispatcher];
        this.updateTime = new Date(this.metricsService.metricsGroup.updateTimestamp);

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

        // sendPacketRate
        this.sendPacketRate_DataArr = [];
        this.sendPacketRate_Indexes = [];
        if (data.selected.sendPacketRate) {
            this.sendPacketRate_Unit = data.selected.sendPacketRate.unit;
            this.sendPacketRate_Object = data.selected.sendPacketRate.data;
            for (let key in this.sendPacketRate_Object) {
                this.sendPacketRate_DataArr.push([key, this.sendPacketRate_Object[key]]);
            }
            this.sendPacketRate_Indexes = [...this.sendPacketRate_DataArr.keys()];
        }

        // tcpDataRate
        this.sendDataRate_DataArr = [];
        this.sendDataRate_Indexes = [];
        if (data.selected.sendDataRate) {
            this.sendDataRate_Unit = data.selected.sendDataRate.unit;
            this.sendDataRate_Object = data.selected.sendDataRate.data;
            for (let key in this.sendDataRate_Object) {
                this.sendDataRate_DataArr.push([key, this.sendDataRate_Object[key]]);
            }
            this.sendDataRate_Indexes = [...this.sendDataRate_DataArr.keys()];
        }
    }

    ngOnInit(): void {
        console.log('init dispatcher');
        this._update();
        this.metricsSubscription = this.metricsService.metricsNotifier.subscribe(() => {
            this._update();
        });
        this.listening = this.metricsService.listening;
    }

    ngOnDestroy(): void {
        console.log('destroy dispatcher');
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
