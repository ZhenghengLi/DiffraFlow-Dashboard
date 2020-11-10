import { JsonPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ImageFetcherCommand, ImageFetcherMsgType, IngesterParam, MonitorParam } from './panel.common';

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

    updateTime: Date;
    imageData: ImageData;
    imageEnergyRange: [number, number] = [0, 10];
    imageMeta: any = {};
    analysisResult: any = {};
    imageFeature: any = {};

    // runtime parameters
    //// ingester
    ingesterCurrent: IngesterParam = {
        runNumber: '',
        doubleParam: '',
        integerParam: '',
        stringParam: '',
    };
    ingesterChange: IngesterParam = {
        runNumber: '',
        doubleParam: '',
        integerParam: '',
        stringParam: '',
    };
    //// monitor
    monitorCurrent: MonitorParam = {
        lowerEnergyCut: '',
        upperEnergyCut: '',
        doubleParam: '',
        integerParam: '',
        stringParam: '',
    };
    monitorChange: MonitorParam = {
        lowerEnergyCut: '',
        upperEnergyCut: '',
        doubleParam: '',
        integerParam: '',
        stringParam: '',
    };

    // update status
    //// ingester
    ingesterStatusText: string = 'parameters are not synchronized.';
    ingesterStatusColor: string = 'red';
    //// monitor
    monitorStatusText: string = 'parameters are not synchronized.';
    monitorStatusColor: string = 'red';

    // config name
    private _configUrl: string = 'assets/config.json';
    private _controllerAddress: string;
    private _ingesterConfig: string;
    private _monitorConfig: string;

    private async _fetchConfig(): Promise<void> {
        let response = await fetch(this._configUrl);
        if (!response.ok) {
            throw new Error(`cannot fetch config from ${this._configUrl}.`);
        }
        let config_data = await response.json();
        this._controllerAddress = config_data.controller_address;
        this._ingesterConfig = config_data.ingester_config;
        this._monitorConfig = config_data.monitor_config;
        if (!this._controllerAddress) {
            throw new Error(`there is no controller_address in config ${this._configUrl}`);
        }
        if (!this._ingesterConfig) {
            throw new Error(`there is no ingester_config in config ${this._configUrl}`);
        }
        if (!this._monitorConfig) {
            throw new Error(`there is no monitor_config in config ${this._configUrl}`);
        }
        // debug
        console.log('controller_address:', this._controllerAddress);
        console.log('ingester_config:', this._ingesterConfig);
        console.log('monitor_config:', this._monitorConfig);
    }

    // update actions
    //// ingester
    private async _ingesterSync(): Promise<void> {
        if (!this._controllerAddress || !this._ingesterConfig) {
            await this._fetchConfig();
        }
        let ingesterConfigUrl = 'http://' + this._controllerAddress + '/config/' + this._ingesterConfig;
        let response = await fetch(ingesterConfigUrl);
        if (!response.ok) {
            throw new Error(`cannot get ingester config from url ${ingesterConfigUrl}.`);
        }
        let ingesterConfigData = await response.json();
        this.ingesterCurrent.runNumber = this.ingesterChange.runNumber = ingesterConfigData.data?.dy_run_number;
        this.ingesterCurrent.doubleParam = this.ingesterChange.doubleParam = ingesterConfigData.data?.dy_param_double;
        this.ingesterCurrent.integerParam = this.ingesterChange.integerParam = ingesterConfigData.data?.dy_param_int;
        this.ingesterCurrent.stringParam = this.ingesterChange.stringParam = ingesterConfigData.data?.dy_param_string;
    }

    onIngesterSync(): void {
        this.ingesterStatusText = 'synchronizing parameters ...';
        this.ingesterStatusColor = 'purple';
        this._ingesterSync()
            .then(() => {
                this.ingesterStatusText = 'successfully synchronized all parameters.';
                this.ingesterStatusColor = 'green';
            })
            .catch((err) => {
                this.ingesterStatusText = 'failed to synchronize all parameters.';
                this.ingesterStatusColor = 'red';
                console.error(err);
            });
    }

    private async _ingesterUpdateAll(): Promise<void> {
        if (!this._controllerAddress || !this._ingesterConfig) {
            await this._fetchConfig();
        }
        let ingesterConfigUrl = 'http://' + this._controllerAddress + '/config/' + this._ingesterConfig;
        let patch_data: any = {};
        if (this.ingesterCheckRunNumber()) {
            patch_data.dy_run_number = this.ingesterChange.runNumber;
        }
        if (this.ingesterCheckDoubleParam()) {
            patch_data.dy_param_double = this.ingesterChange.doubleParam;
        }
        if (this.ingesterCheckIntegerParam()) {
            patch_data.dy_param_int = this.ingesterChange.integerParam;
        }
        if (this.ingesterCheckStringParam()) {
            patch_data.dy_param_string = this.ingesterChange.stringParam;
        }
        let response = await fetch(ingesterConfigUrl, {
            method: 'PATCH',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(patch_data),
        });
        if (!response.ok) {
            throw new Error(`cannot patch config by url ${ingesterConfigUrl}`);
        }
    }

    onIngesterUpdateAll() {
        this.ingesterStatusText = 'parameter updating in progress ...';
        this.ingesterStatusColor = 'purple';
        this._ingesterUpdateAll()
            .then(() => {
                this.ingesterStatusText = 'parameter updating succeeded.';
                this.ingesterStatusColor = 'green';
                this.onIngesterSync();
            })
            .catch((err) => {
                this.ingesterStatusText = 'parameter updating failed.';
                this.ingesterStatusColor = 'red';
                console.error(err);
            });
    }

    private async _ingesterUpdateOne(key: string): Promise<void> {
        if (!this._controllerAddress || !this._ingesterConfig) {
            await this._fetchConfig();
        }
        let ingesterConfigUrl = 'http://' + this._controllerAddress + '/config/' + this._ingesterConfig;
        let patch_data: any = {};
        switch (key) {
            case 'runNumber':
                patch_data.dy_run_number = this.ingesterChange.runNumber;
                break;
            case 'doubleParam':
                patch_data.dy_param_double = this.ingesterChange.doubleParam;
                break;
            case 'integerParam':
                patch_data.dy_param_int = this.ingesterChange.integerParam;
                break;
            case 'stringParam':
                patch_data.dy_param_string = this.ingesterChange.stringParam;
                break;
            default:
                throw new Error(`unknown key ${key}`);
        }
        let response = await fetch(ingesterConfigUrl, {
            method: 'PATCH',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(patch_data),
        });
        if (!response.ok) {
            throw new Error(`cannot patch config by url ${ingesterConfigUrl}`);
        }
    }

    onIngesterUpdateOne(key: string): void {
        this.ingesterStatusText = 'parameter updating in progress ...';
        this.ingesterStatusColor = 'purple';
        this._ingesterUpdateOne(key)
            .then(() => {
                this.ingesterStatusText = 'parameter updating succeeded.';
                this.ingesterStatusColor = 'green';
                this.onIngesterSync();
            })
            .catch((err) => {
                this.ingesterStatusText = 'parameter updating failed.';
                this.ingesterStatusColor = 'red';
                console.error(err);
            });
    }

    //// monitor
    private async _monitorSync(): Promise<void> {
        if (!this._controllerAddress || !this._monitorConfig) {
            await this._fetchConfig();
        }
        let monitorConfigUrl = 'http://' + this._controllerAddress + '/config/' + this._monitorConfig;
        let response = await fetch(monitorConfigUrl);
        if (!response.ok) {
            throw new Error(`cannot get monitor config from url ${monitorConfigUrl}.`);
        }
        let monitorConfigData = await response.json();
        this.monitorCurrent.lowerEnergyCut = this.monitorChange.lowerEnergyCut =
            monitorConfigData.data?.dy_energy_down_cut;
        this.monitorCurrent.upperEnergyCut = this.monitorChange.upperEnergyCut =
            monitorConfigData.data?.dy_energy_up_cut;
        this.monitorCurrent.doubleParam = this.monitorChange.doubleParam = monitorConfigData.data?.dy_param_double;
        this.monitorCurrent.integerParam = this.monitorChange.integerParam = monitorConfigData.data?.dy_param_int;
        this.monitorCurrent.stringParam = this.monitorChange.stringParam = monitorConfigData.data?.dy_param_string;
    }

    onMonitorSync(): void {
        this.monitorStatusText = 'synchronizing parameters ...';
        this.monitorStatusColor = 'purple';
        this._monitorSync()
            .then(() => {
                this.monitorStatusText = 'successfully synchronized all parameters.';
                this.monitorStatusColor = 'green';
            })
            .catch((err) => {
                this.monitorStatusText = 'failed to synchronize all parameters.';
                this.monitorStatusColor = 'red';
                console.error(err);
            });
    }

    private async _monitorUpdateAll(): Promise<void> {
        if (!this._controllerAddress || !this._monitorConfig) {
            await this._fetchConfig();
        }
        let monitorConfigUrl = 'http://' + this._controllerAddress + '/config/' + this._monitorConfig;
        let patch_data: any = {};
        if (this.monitorCheckLowerEnergyCut()) {
            patch_data.dy_energy_down_cut = this.monitorChange.lowerEnergyCut;
        }
        if (this.monitorCheckUpperEnergyCut()) {
            patch_data.dy_energy_up_cut = this.monitorChange.upperEnergyCut;
        }
        if (this.monitorCheckDoubleParam()) {
            patch_data.dy_param_double = this.monitorChange.doubleParam;
        }
        if (this.monitorCheckIntegerParam()) {
            patch_data.dy_param_int = this.monitorChange.integerParam;
        }
        if (this.monitorCheckStringParam()) {
            patch_data.dy_param_string = this.monitorChange.stringParam;
        }
        let response = await fetch(monitorConfigUrl, {
            method: 'PATCH',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(patch_data),
        });
        if (!response.ok) {
            throw new Error(`cannot patch config by url ${monitorConfigUrl}`);
        }
    }

    onMonitorUpdateAll(): void {
        this.monitorStatusText = 'parameter updating in progress ...';
        this.monitorStatusColor = 'purple';
        this._monitorUpdateAll()
            .then(() => {
                this.monitorStatusText = 'parameter updating succeeded.';
                this.monitorStatusColor = 'green';
                this.onMonitorSync();
            })
            .catch((err) => {
                this.monitorStatusText = 'parameter updating failed.';
                this.monitorStatusColor = 'red';
                console.error(err);
            });
    }

    private async _monitorUpdateOne(key: string): Promise<void> {
        if (!this._controllerAddress || !this._monitorConfig) {
            await this._fetchConfig();
        }
        let monitorConfigUrl = 'http://' + this._controllerAddress + '/config/' + this._monitorConfig;
        let patch_data: any = {};
        switch (key) {
            case 'lowerEnergyCut':
                patch_data.dy_energy_down_cut = this.monitorChange.lowerEnergyCut;
                break;
            case 'upperEnergyCut':
                patch_data.dy_energy_up_cut = this.monitorChange.upperEnergyCut;
                break;
            case 'doubleParam':
                patch_data.dy_param_double = this.monitorChange.doubleParam;
                break;
            case 'integerParam':
                patch_data.dy_param_int = this.monitorChange.integerParam;
                break;
            case 'stringParam':
                patch_data.dy_param_string = this.monitorChange.stringParam;
                break;
            default:
                throw new Error(`unknown key ${key}`);
        }
        let response = await fetch(monitorConfigUrl, {
            method: 'PATCH',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(patch_data),
        });
        if (!response.ok) {
            throw new Error(`cannot patch config by url ${monitorConfigUrl}`);
        }
    }

    onMonitorUpdateOne(key: string): void {
        this.monitorStatusText = 'parameter updating in progress ...';
        this.monitorStatusColor = 'purple';
        this._monitorUpdateOne(key)
            .then(() => {
                this.monitorStatusText = 'parameter updating succeeded.';
                this.monitorStatusColor = 'green';
                this.onMonitorSync();
            })
            .catch((err) => {
                this.monitorStatusText = 'parameter updating failed.';
                this.monitorStatusColor = 'red';
                console.error(err);
            });
    }

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
        return (
            lowerEnergy ||
            upperEnergy ||
            this.monitorCheckDoubleParam() ||
            this.monitorCheckIntegerParam() ||
            this.monitorCheckStringParam()
        );
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

    ngOnInit(): void {
        console.log('init panel');
        this._imageFetcher = new Worker('./image-fetcher.worker', { type: 'module' });
        this._imageFetcher.onmessage = this._messageHandler;
        this._fetchConfig().catch((err) => console.error(err));
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
