import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';

@Injectable()
export class MetricsDataService {
    constructor(private http: HttpClient) {}

    private _configUrl: string = 'assets/config.json';
    private _myIdVal: number = 0;
    private _aggregatorAddress: string = null;

    private _intervalSubscription: Subscription = null;

    log(msg: string): void {
        console.log('metrics-data: ', msg);
    }

    get myId(): number {
        return this._myIdVal;
    }

    start(): void {
        this._myIdVal = Math.random();
        console.log('start metrics-data service:', this._myIdVal);
        this.http.get(this._configUrl).subscribe((data) => {
            if ('aggregator_address' in data) {
                this._aggregatorAddress = data['aggregator_address'];
                console.log('aggregator_address = ', this._aggregatorAddress);
                this._intervalSubscription = interval(1000).subscribe((count) => this._updateMetrics(count));
            } else {
                console.log('no aggregator_address in config file');
            }
        });
    }

    stop(): void {
        console.log('stop metrics-data service');
        this._intervalSubscription?.unsubscribe();
    }

    private _updateMetrics(count: number): void {
        console.log(count);
    }
}
