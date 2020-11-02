import { Injectable } from '@angular/core';

@Injectable()
export class ControllerService {
    constructor() {}

    private _imageFetcher: Worker;

    imageFetcherStart(): void {
        console.log('start image fetching worker');
        this._imageFetcher = new Worker('./image-fetcher.worker', { type: 'module' });
    }

    imageFetcherStop(): void {
        console.log('stop image fetching worker');
        this._imageFetcher?.terminate();
        this._imageFetcher = undefined;
    }

    imageFetcherPause(): void {
        console.log('pause image fetching');
    }

    imageFetcherResume(): void {
        console.log('resume image fetching');
    }
}
