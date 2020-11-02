/// <reference lib="webworker" />

import { interval, Subscription } from 'rxjs';

import * as msgpack from '@msgpack/msgpack';

import { ImageFetcherCommand } from './panel.common';

console.log('image fetching worker is running ...');

//=============================================================================

async function fetchAndProcess(count: number) {
    console.log(count);
    if (typeof controllerAddress !== 'string') return;
    let eventSrcUrl = 'http://' + controllerAddress + '/event/' + lastEventKey;
    let eventResponse = await fetch(eventSrcUrl, { cache: 'no-store' });
    if (!eventResponse.ok) {
        console.log(`cannot fetch image data from url ${eventSrcUrl}`);
        return;
    }
    eventResponse.headers.forEach((value, name) => {
        console.log(name, '=>', value);
    });
    let eventData = await eventResponse.arrayBuffer();
    let eventObject = msgpack.decode(eventData);
    console.log(eventObject);
}

//=============================================================================
// management functions

const configUrl: string = 'assets/config.json';
let intervalSubscription: Subscription;

var intervalTime: number = 1000;
var controllerAddress: string;
var lastEventKey: number = 0;

onmessage = ({ data }) => {
    console.log('received message: ', data);

    switch (data.command) {
        case ImageFetcherCommand.setinterval:
            console.log('setIntervalTime: ', data.payload);
            setIntervalTime(data.payload);
            break;
        case ImageFetcherCommand.start:
            console.log('start fetching.');
            start();
            break;
        case ImageFetcherCommand.stop:
            console.log('stop fetching.');
            stop();
            break;
        default:
            break;
    }
};

function setIntervalTime(time: number): void {
    //
}

async function start() {
    if (intervalSubscription) return;
    if (typeof controllerAddress !== 'string') {
        let response = await fetch(configUrl);
        if (!response.ok) {
            throw new Error(`connot fetch addresses from ${configUrl}`);
        }
        let config_data = await response.json();
        controllerAddress = config_data.controller_address;
        console.log('controller_address:', controllerAddress);
        if (typeof controllerAddress != 'string') {
            throw new Error('there is no controller_address in config');
        }
    }
    intervalSubscription = interval(intervalTime).subscribe((count) => {
        fetchAndProcess(count).catch((err) => console.log(err));
    });
}

function stop(): void {
    intervalSubscription?.unsubscribe();
    intervalSubscription = undefined;
}

start().catch((err) => console.error(err));
