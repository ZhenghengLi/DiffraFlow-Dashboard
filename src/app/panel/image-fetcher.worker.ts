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
    let eventObject = <any>msgpack.decode(eventData);
    console.log(eventObject);

    // convert eventObject to canvas image and post it to frontend
    //

    let imageData: ImageData = composeImage(eventObject.image_data.image_frame_vec);

    postMessage(
        {
            type: ImageFetcherMsgType.image,
            payload: {
                imageData,
                imageMeta: count,
                analysisResult: eventObject.analysis_result,
                imageFeature: eventObject.image_feature,
            },
        },
        [imageData.data.buffer]
    );
}

//=============================================================================
// management functions

const configUrl: string = 'assets/config.json';
let intervalSubscription: Subscription;

var intervalTime: number = 1000;
var controllerAddress: string;
var lastEventKey: number = 0;

onmessage = ({ data }) => {
    console.log('received command: ', data);
    switch (data.command) {
        case ImageFetcherCommand.start:
            console.log('start fetching.');
            if (typeof data.payload === 'string' && data.payload.match(/^\d+\.?\d*$/)) {
                intervalTime = parseInt(data.payload);
                if (intervalTime < 300) intervalTime = 300;
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

// ============================================================================

// Uint8Array(65536)[16] => ImageData(width, height)
function composeImage(frames: Uint8Array[], width: number = 1300, height = 1300): ImageData | null {
    // check data
    if (frames.length != 16) return null;
    for (let frame of frames) {
        if (frame.length !== 65536) return null;
    }
    let image = new ImageData(width, height);
    let buffer = new Uint32Array(image.data.buffer);

    // TODO: do compose

    return image;
}
