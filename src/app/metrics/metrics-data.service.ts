import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';

@Injectable()
export class MetricsDataService {
    private _configUrl: string = 'assets/config.json';
    private _aggregatorAddress: string = null;

    private _intervalSubscription: Subscription = null;
    private _intervalTime: number = 1000;

    private _senderCurrentMetrics: any = { fullMetrics: {}, selectedParameters: { rate1: [], rate2: [] } };
    private _dispatcherCurrentMetrics: object;
    private _combinerCurrentMetrics: object;
    private _ingesterCurrentMetrics: object;
    private _monitorCurrentMetrics: object;
    private _controllerCurrentMetrics: object;
    private _metricsUpdateTime: number = 0;

    senderMetrics: EventEmitter<object> = new EventEmitter<object>();
    dispatcherMetrics: EventEmitter<object> = new EventEmitter<object>();
    combinerMetrics: EventEmitter<object> = new EventEmitter<object>();
    ingesterMetrics: EventEmitter<object> = new EventEmitter<object>();
    monitorMetrics: EventEmitter<object> = new EventEmitter<object>();
    controllerMetrics: EventEmitter<object> = new EventEmitter<object>();

    constructor(private _http: HttpClient) {}

    private _updateMetrics(count: number): void {
        // debug
        console.log(count);

        this._senderCurrentMetrics.fullMetrics = { value: Math.random() };
        this._senderCurrentMetrics.selectedParameters.rate1 = [];
        this._senderCurrentMetrics.selectedParameters.rate2 = [];
        let currentTime = new Date().getTime();
        for (let i = 0; i <= 60; i++) {
            this._senderCurrentMetrics.selectedParameters.rate1.push([
                currentTime - i * 1000,
                1.5 + Math.sin((i - count * 0.5) / 5),
            ]);
            this._senderCurrentMetrics.selectedParameters.rate2.push([
                currentTime - i * 1000,
                1.5 + Math.cos((i - count * 0.5) / 5),
            ]);
        }

        this.senderMetrics.emit(this._senderCurrentMetrics);

        return;

        this._http.get('http://' + this._aggregatorAddress).subscribe((data) => {
            let update_time = data['update_timestamp'];
            if (typeof update_time === 'number' && update_time > this._metricsUpdateTime) {
                this._metricsUpdateTime = update_time;
            } else {
                return;
            }

            console.log('update_timestamp:', new Date(this._metricsUpdateTime).toISOString());

            this._senderCurrentMetrics = data['sender'];
            this.senderMetrics.emit(this._senderCurrentMetrics);

            this._dispatcherCurrentMetrics = data['dispatcher'];
            this.dispatcherMetrics.emit(this._dispatcherCurrentMetrics);

            this._combinerCurrentMetrics = data['combiner'];
            this.combinerMetrics.emit(this._combinerCurrentMetrics);

            this._ingesterCurrentMetrics = data['ingester'];
            this.ingesterMetrics.emit(this._ingesterCurrentMetrics);

            this._monitorCurrentMetrics = data['monitor'];
            this.monitorMetrics.emit(this._monitorCurrentMetrics);

            this._controllerCurrentMetrics = data['controller'];
            this.controllerMetrics.emit(this._controllerCurrentMetrics);
        });
    }

    start(): void {
        if (this._intervalSubscription) {
            // already started.
            return;
        }
        console.log('start metrics-data service');
        this._http.get(this._configUrl).subscribe((data) => {
            if ('aggregator_address' in data) {
                this._aggregatorAddress = data['aggregator_address'];
                console.log('aggregator_address = ', this._aggregatorAddress);
                this._intervalSubscription = interval(this._intervalTime).subscribe((count) =>
                    this._updateMetrics(count)
                );
            } else {
                console.error('no aggregator_address in config file');
            }
        });
    }

    stop(): void {
        console.log('stop metrics-data service');
        this._intervalSubscription?.unsubscribe();
        this._intervalSubscription = null;
    }

    get running(): boolean {
        return this._intervalSubscription ? true : false;
    }

    setIntervalTime(time: number): void {
        this._intervalTime = time > 500 ? time : 500;
        if (this._intervalSubscription) {
            this._intervalSubscription?.unsubscribe();
            this._intervalSubscription = interval(this._intervalTime).subscribe((count) => this._updateMetrics(count));
        }
    }
}
