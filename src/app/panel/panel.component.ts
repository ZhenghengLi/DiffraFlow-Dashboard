import { Component, OnDestroy, OnInit } from '@angular/core';
import { ImageFetcherCommand, ImageFetcherMsgType, IngesterParam, MonitorParam } from './panel.common';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-panel',
    templateUrl: './panel.component.html',
    styleUrls: ['./panel.component.scss'],
})
export class PanelComponent implements OnInit, OnDestroy {
    constructor(private _http: HttpClient) {}

    private _imageFetcher: Worker;

    intervalTime: string = '1000';
    runningFlag: boolean = false;

    updateTime: Date;
    imageData: ImageData;
    imageEnergyRange: [number, number] = [0, 10];
    imageMeta: any = {};
    analysisResult: any = {};
    imageFeature: any = {};

    // runtime parameters
    //// ingester
    ingesterCurrent: IngesterParam = {
        runNumber: '1',
        doubleParam: '2',
        integerParam: '3',
        stringParam: '4',
    };
    ingesterChange: IngesterParam = {
        runNumber: '5',
        doubleParam: '6',
        integerParam: '7',
        stringParam: '8',
    };
    //// monitor
    monitorCurrent: MonitorParam = {
        lowerEnergyCut: '9',
        upperEnergyCut: '10',
        doubleParam: '11',
        integerParam: '12',
        stringParam: '13',
    };
    monitorChange: MonitorParam = {
        lowerEnergyCut: '14',
        upperEnergyCut: '15',
        doubleParam: '16',
        integerParam: '17',
        stringParam: '18',
    };

    // update status
    //// ingester
    ingesterStatusText: string = 'ingester status';
    ingesterStatusColor: string = 'green';
    //// monitor
    monitorStatusText: string = 'monitor status';
    monitorStatusColor: string = 'green';

    // check functions
    //// ingester
    ingesterCheckAll(): boolean {
        return (
            this.ingesterCheckRunNumber() ||
            this.ingesterCheckDoubleParam() ||
            this.ingesterCheckIntegerParam() ||
            this.ingesterCheckStringParam()
        );
    }
    ingesterCheckRunNumber(): boolean {
        if (!this.ingesterChange.runNumber) return false;
        if (this.ingesterChange.runNumber === this.ingesterCurrent.runNumber) return false;
        if (!this.ingesterChange.runNumber.match(/^\d+$/)) return false;
        return true;
    }
    ingesterCheckDoubleParam(): boolean {
        if (!this.ingesterChange.doubleParam) return false;
        if (this.ingesterChange.doubleParam === this.ingesterCurrent.doubleParam) return false;
        if (!this.ingesterChange.doubleParam.match(/^-?\d+\.?\d*$/)) return false;
        if (parseFloat(this.ingesterChange.doubleParam) === parseFloat(this.ingesterCurrent.doubleParam)) {
            return false;
        }
        return true;
    }
    ingesterCheckIntegerParam(): boolean {
        if (!this.ingesterChange.integerParam) return false;
        if (this.ingesterChange.integerParam === this.ingesterCurrent.integerParam) return false;
        if (!this.ingesterChange.integerParam.match(/^-?\d+$/)) return false;
        return true;
    }
    ingesterCheckStringParam(): boolean {
        if (!this.ingesterChange.stringParam) return false;
        if (this.ingesterChange.stringParam === this.ingesterCurrent.stringParam) return false;
        return true;
    }

    ngOnInit(): void {
        console.log('init panel');
        this._imageFetcher = new Worker('./image-fetcher.worker', { type: 'module' });
        this._imageFetcher.onmessage = this._messageHandler;
    }
    //// monitor
    monitorCheckAll(): boolean {
        // check energy range
        let lowerEnergy = this.monitorCheckLowerEnergyCut();
        let upperEnergy = this.monitorCheckUpperEnergyCut();
        if (lowerEnergy && upperEnergy) {
            if (parseFloat(this.monitorChange.lowerEnergyCut) >= parseFloat(this.monitorChange.upperEnergyCut)) {
                return false;
            }
        }
        return lowerEnergy || upperEnergy;
    }
    monitorCheckLowerEnergyCut(): boolean {
        if (!this.monitorChange.lowerEnergyCut) return false;
        if (this.monitorChange.lowerEnergyCut === this.monitorCurrent.lowerEnergyCut) return false;
        if (!this.monitorChange.lowerEnergyCut.match(/^-?\d+\.?\d*$/)) return false;
        if (parseFloat(this.monitorChange.lowerEnergyCut) === parseFloat(this.monitorCurrent.lowerEnergyCut)) {
            return false;
        }
        if (parseFloat(this.monitorChange.lowerEnergyCut) < parseFloat(this.monitorCurrent.upperEnergyCut)) {
            return true;
        } else {
            return false;
        }
    }
    monitorCheckUpperEnergyCut(): boolean {
        if (!this.monitorChange.upperEnergyCut) return false;
        if (this.monitorChange.upperEnergyCut === this.monitorCurrent.upperEnergyCut) return false;
        if (!this.monitorChange.upperEnergyCut.match(/^-?\d+\.?\d*$/)) return false;
        if (parseFloat(this.monitorChange.upperEnergyCut) === parseFloat(this.monitorCurrent.upperEnergyCut)) {
            return false;
        }
        if (parseFloat(this.monitorChange.upperEnergyCut) > parseFloat(this.monitorCurrent.lowerEnergyCut)) {
            return true;
        } else {
            return false;
        }
    }
    monitorCheckDoubleParam(): boolean {
        if (!this.monitorChange.doubleParam) return false;
        if (this.monitorChange.doubleParam === this.monitorCurrent.doubleParam) return false;
        if (!this.monitorChange.doubleParam.match(/^-?\d+\.?\d*$/)) return false;
        if (parseFloat(this.monitorChange.doubleParam) === parseFloat(this.monitorCurrent.doubleParam)) {
            return false;
        }
        return true;
    }
    monitorCheckIntegerParam(): boolean {
        if (!this.monitorChange.integerParam) return false;
        if (this.monitorChange.integerParam === this.monitorCurrent.integerParam) return false;
        if (!this.monitorChange.integerParam.match(/^-?\d+$/)) return false;
        return true;
    }
    monitorCheckStringParam(): boolean {
        if (!this.monitorChange.stringParam) return false;
        if (this.monitorChange.stringParam === this.monitorCurrent.stringParam) return false;
        return true;
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
                this.updateTime = data.payload.updateTime;
                this.imageData = data.payload.imageData;
                this.imageEnergyRange = data.payload.imageEnergyRange;
                this.imageMeta = data.payload.imageMeta;
                this.analysisResult = data.payload.analysisResult;
                this.imageFeature = data.payload.imageFeature;
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
