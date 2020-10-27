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

    // metrics
    public metrics_Indexes: number[] = [];
    public metrics_DataArr: [string, any][] = [];
    public metrics_Object: any;

    // sendFrameRate
    public sendFrameRate_Indexes: number[] = [];
    public sendFrameRate_DataArr: [string, any][] = [];
    public sendFrameRate_Unit: string = '';
    public sendFrameRate_Object: any;

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

    private _update(data: MetricsData) {
        // check type
        if (data.type !== MetricsType.sender) return;

        this.updateTime = new Date();

        // metrics
        this.metrics_Object = data.metrics;
        this.metrics_DataArr = [];
        this.metrics_Indexes = [];
        for (let key in this.metrics_Object) {
            this.metrics_DataArr.push([key, this.metrics_Object[key]]);
        }
        this.metrics_Indexes = [...this.metrics_DataArr.keys()];

        // sendFrameRate
        this.sendFrameRate_DataArr = [];
        this.sendFrameRate_Indexes = [];
        if (data.selected.sendFrameRate) {
            this.sendFrameRate_Unit = data.selected.sendFrameRate.unit;
            this.sendFrameRate_Object = data.selected.sendFrameRate.data;
            for (let key in this.sendFrameRate_Object) {
                this.sendFrameRate_DataArr.push([key, this.sendFrameRate_Object[key]]);
            }
            this.sendFrameRate_Indexes = [...this.sendFrameRate_DataArr.keys()];
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
        if (data.selected.tcpDataRate) {
            this.tcpDataRate_Unit = data.selected.tcpDataRate.unit;
            this.tcpDataRate_Object = data.selected.tcpDataRate.data;
            for (let key in this.tcpDataRate_Object) {
                this.tcpDataRate_DataArr.push([key, this.tcpDataRate_Object[key]]);
            }
            this.tcpDataRate_Indexes = [...this.tcpDataRate_DataArr.keys()];
        }

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
