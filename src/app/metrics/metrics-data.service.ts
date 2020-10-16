import { Injectable } from '@angular/core';

@Injectable()
export class MetricsDataService {
    constructor() {}

    private myIdVal: number = 0;

    log(msg: string): void {
        console.log('metrics-data: ', msg);
    }

    get myId(): number {
        return this.myIdVal;
    }

    start(): void {
        this.myIdVal = Math.random();
        console.log('start metrics-data service:', this.myIdVal);
    }

    stop(): void {
        console.log('stop metrics-data service');
    }
}
