/// <reference lib="webworker" />

import { interval, Subscription } from 'rxjs';

import * as msgpack from '@msgpack/msgpack';

import { ImageFetcherCommand, ImageFetcherMsgType } from './panel.common';

console.log('image fetching worker is running ...');

//=============================================================================

async function fetchAndProcess(count: number) {
    console.log(count);
    if (typeof controllerAddress !== 'string') return;
    let eventSrcUrl = 'http://' + controllerAddress + '/event/' + lastEventKey;
    let eventResponse = await fetch(eventSrcUrl, { cache: 'no-store' });
    if (!eventResponse.ok) {
        console.log(`cannot fetch image data from url ${eventSrcUrl} with status ${eventResponse.statusText}`);
        return;
    }
    let eventKey = eventResponse.headers.get('event-key');
    if (typeof eventKey === 'string') {
        lastEventKey = parseInt(eventKey);
    }
    console.log('lastEventKey:', lastEventKey);

    let eventData = await eventResponse.arrayBuffer();
    let eventObject = msgpack.decode(eventData);
    console.log(eventObject);

    // convert eventObject to canvas image and post it to frontend
    //

    postMessage({
        type: ImageFetcherMsgType.image,
        payload: {},
    });
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
        case ImageFetcherCommand.start:
            console.log('start fetching.');
            if (typeof data.payload === 'number') {
                intervalTime = data.payload > 300 ? data.payload : 300;
            }
            start()
                .then(() => {
                    postMessage({
                        type: ImageFetcherMsgType.status,
                        payload: {
                            intervalTime,
                            running: true,
                        },
                    });
                })
                .catch((err) => {
                    console.error(err);
                    postMessage({
                        type: ImageFetcherMsgType.status,
                        payload: {
                            intervalTime,
                            running: false,
                        },
                    });
                });
            break;
        case ImageFetcherCommand.stop:
            console.log('stop fetching.');
            stop();
            postMessage({
                type: ImageFetcherMsgType.status,
                payload: {
                    intervalTime,
                    running: false,
                },
            });
            break;
    }
};

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
    lastEventKey = 0;
    intervalSubscription = interval(intervalTime).subscribe((count) => {
        fetchAndProcess(count).catch((err) => console.log(err));
    });
}

function stop(): void {
    intervalSubscription?.unsubscribe();
    intervalSubscription = undefined;
}
