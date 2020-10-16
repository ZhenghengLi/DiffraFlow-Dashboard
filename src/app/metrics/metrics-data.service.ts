import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';

@Injectable()
export class MetricsDataService {
    private _configUrl: string = 'assets/config.json';
    private _aggregatorAddress: string = null;

    private _intervalSubscription: Subscription = null;
    private _intervalTime: number = 1000;

    constructor(private _http: HttpClient) {}

    private _updateMetrics(count: number): void {
        console.log(count);
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
