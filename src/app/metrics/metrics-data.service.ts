import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MetricsType, MetricsCommand, MetricsGroup } from './metrics.common';

@Injectable()
export class MetricsDataService {
    metricsNotifier: EventEmitter<void> = new EventEmitter<void>();
    metricsGroup: MetricsGroup;
    get listening(): boolean {
        return this._listeningFlag;
    }

    constructor(private _http: HttpClient) {}

    private _metricsFetcher: Worker;
    private _listeningFlag: boolean = false;

    start(): void {
        console.log('start metrics fetching worker');
        if (!this._metricsFetcher) {
            this._metricsFetcher = new Worker('./metrics-fetcher.worker', { type: 'module' });
        }
        this.listen();
    }

    stop(): void {
        this.unlisten();
        console.log('stop metrics fetching worker');
        this._metricsFetcher?.terminate();
        this._metricsFetcher = undefined;
    }

    listen(): void {
        if (this._listeningFlag) return;
        if (this._metricsFetcher) {
            this._metricsFetcher.onmessage = ({ data }) => {
                this.metricsGroup = data;
                this.metricsNotifier.emit();
            };
            this._listeningFlag = true;
        }
    }

    unlisten(): void {
        if (!this._listeningFlag) return;
        if (this._metricsFetcher) {
            this._metricsFetcher.onmessage = undefined;
        }
        this._listeningFlag = false;
    }

    setinterval(time: number): void {
        if (this._metricsFetcher) {
            this._metricsFetcher.postMessage({ command: MetricsCommand.setinterval, payload: time });
        }
    }
}
