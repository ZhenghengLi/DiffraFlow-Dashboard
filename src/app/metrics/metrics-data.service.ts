import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MetricsType, MetricsCommand, MetricsData } from './metrics.common';

@Injectable()
export class MetricsDataService {
    metricsNotifier: EventEmitter<MetricsData> = new EventEmitter<MetricsData>();

    constructor(private _http: HttpClient) {}

    private _metricsFetcher: Worker;

    start(): void {
        if (!this._metricsFetcher) {
            this._metricsFetcher = new Worker('./metrics-fetcher.worker', { type: 'module' });
        }
    }

    select(type: MetricsType): void {
        if (this._metricsFetcher) {
            this._metricsFetcher.postMessage({ command: MetricsCommand.select, payload: type });
            this._metricsFetcher.onmessage = ({ data }) => {
                this.metricsNotifier.emit(data);
            };
        }
    }

    unselect(): void {
        if (this._metricsFetcher) {
            this._metricsFetcher.postMessage({ command: MetricsCommand.select, payload: MetricsType.none });
            this._metricsFetcher.onmessage = undefined;
        }
    }

    setinterval(time: number): void {
        if (this._metricsFetcher) {
            this._metricsFetcher.postMessage({ command: MetricsCommand.setinterval, payload: time });
        }
    }

    stop(): void {
        this._metricsFetcher?.terminate();
        this._metricsFetcher = undefined;
    }
}
