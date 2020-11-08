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

    imageData: ImageData;
    imageEnergyRange: [number, number] = [0, 10];
    imageMeta: any = {};
    analysisResult: any = {};
    imageFeature: any = {};

    ngOnInit(): void {
        console.log('init panel');
        this._imageFetcher = new Worker('./image-fetcher.worker', { type: 'module' });
        this._imageFetcher.onmessage = this._messageHandler;
    }

    ngOnDestroy(): void {
        console.log('destroy panel');
        this._imageFetcher?.terminate();
        this._imageFetcher = undefined;
    }

    private _messageHandler = ({ data }) => {
        switch (data.type) {
            case ImageFetcherMsgType.status:
                this.intervalTime = '' + data.payload.intervalTime;
                this.runningFlag = data.payload.running;
                break;
            case ImageFetcherMsgType.image:
                this.imageData = data.payload.imageData;
                this.imageMeta = data.payload.imageMeta;
                this.analysisResult = data.payload.analysisResult;
                this.imageFeature = data.payload.imageFeature;
                this.imageEnergyRange = [this.imageMeta?.min_energy, this.imageMeta?.max_energy];
                break;
        }
    };

    imageFetcherStart(): void {
        console.log('start image fetching');
        if (this._imageFetcher) {
            this._imageFetcher.postMessage({
                command: ImageFetcherCommand.start,
                payload: this.intervalTime,
            });
        } else {
            console.warn('image fetching worker is not started.');
        }
    }

    imageFetcherStop(): void {
        console.log('stop image fetching');
        if (this._imageFetcher) {
            this._imageFetcher.postMessage({
                command: ImageFetcherCommand.stop,
            });
        } else {
            console.warn('image fetching worker is not started.');
        }
    }
}
