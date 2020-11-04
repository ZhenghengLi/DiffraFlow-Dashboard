import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ImageFetcherCommand, ImageFetcherMsgType } from './panel.common';

@Component({
    selector: 'app-panel',
    templateUrl: './panel.component.html',
    styleUrls: ['./panel.component.scss'],
})
export class PanelComponent implements OnInit, OnDestroy {
    constructor() {}

    private _imageFetcher: Worker;

    intervalTime: string = '1000';

    runningFlag: boolean = false;
    imageData: string;

    ngOnInit(): void {
        this._imageFetcher = new Worker('./image-fetcher.worker', { type: 'module' });
        this._imageFetcher.onmessage = this._messageHandler;
    }

    ngOnDestroy(): void {
        this._imageFetcher?.terminate();
        this._imageFetcher = undefined;
    }

    private _messageHandler = ({ data }) => {
        console.log('received message:', data);
        switch (data.type) {
            case ImageFetcherMsgType.status:
                this.intervalTime = '' + data.payload.intervalTime;
                this.runningFlag = data.payload.running;
                break;
            case ImageFetcherMsgType.image:
                this.imageData = JSON.stringify(data.payload);
                break;
        }
    };

    imageFetcherStart(): void {
        console.log('start image fetching');
        if (!this._imageFetcher) {
            console.warn('image fetching worker is not started.');
        }
        this._imageFetcher.postMessage({
            command: ImageFetcherCommand.start,
            payload: this.intervalTime,
        });
    }

    imageFetcherStop(): void {
        console.log('stop image fetching');
        if (!this._imageFetcher) {
            console.warn('image fetching worker is not started.');
        }
        this._imageFetcher.postMessage({
            command: ImageFetcherCommand.stop,
        });
    }
}
