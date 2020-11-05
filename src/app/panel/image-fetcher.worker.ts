/// <reference lib="webworker" />

import { interval, Subscription } from 'rxjs';

import * as msgpack from '@msgpack/msgpack';

import { ImageFetcherCommand, ImageFetcherMsgType, generateColorTable } from './panel.common';

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

    // convert eventObject to canvas image and post it to frontend

    let imageData: ImageData = composeImage(eventObject.image_data.image_frame_vec);

    postMessage(
        {
            type: ImageFetcherMsgType.image,
            payload: {
                imageData,
                imageMeta: {
                    alignment_vec: eventObject.image_data.alignment_vec,
                    bunch_id: eventObject.image_data.bunch_id,
                    calib_level: eventObject.image_data.calib_level,
                    late_arrived: eventObject.image_data.late_arrived,
                    max_energy: eventObject.image_data.max_energy,
                    min_energy: eventObject.image_data.min_energy,
                },
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
                if (intervalTime < 200) intervalTime = 200;
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

const FRAME_LEN = 65536;
const MOD_COUNT = 16;

// Uint8Array(65536)[16] => ImageData(width, height)
function composeImage(frames: Uint8Array[], width: number = 1300, height = 1300): ImageData | null {
    // check data
    if (!frames) return null;
    if (frames.length != MOD_COUNT) return null;
    for (let frame of frames) {
        if (frame && frame.length !== FRAME_LEN) return null;
    }
    let image = new ImageData(width, height);

    // compose
    const [centerW, centerH] = [width / 2, height / 2];
    const [offsetB, offsetS, modgap, asicgap] = [26, 4, 30, 2];
    //// Q1
    for (let i = 0; i < 4; i++) {
        const firstW = centerW + offsetS + 512 + asicgap * 7;
        const firstH = centerH - offsetB - 128 * (4 - i) - modgap * (3 - i);
        const frame = frames[i];
        if (frame) copyPixel(image, frame, [firstW, firstH], 1, asicgap);
    }
    //// Q2
    for (let i = 0; i < 4; i++) {
        const firstW = centerW + offsetB + 512 + asicgap * 7;
        const firstH = centerH + offsetS + (128 + modgap) * i;
        const frame = frames[4 + i];
        if (frame) copyPixel(image, frame, [firstW, firstH], 1, asicgap);
    }
    //// Q3
    for (let i = 0; i < 4; i++) {
        const firstW = centerW - (offsetS + 512 + asicgap * 7);
        const firstH = centerH + offsetB + 128 * (i + 1) + modgap * i;
        const frame = frames[8 + i];
        if (frame) copyPixel(image, frame, [firstW, firstH], -1, asicgap);
    }
    //// Q4
    for (let i = 0; i < 4; i++) {
        const firstW = centerW - (offsetB + 512 + asicgap * 7);
        const firstH = centerH - offsetS - (128 + modgap) * (3 - i);
        const frame = frames[12 + i];
        if (frame) copyPixel(image, frame, [firstW, firstH], -1, asicgap);
    }

    return image;
}

function copyPixel(image: ImageData, frame: Uint8Array, firstpos: [number, number], rot: 1 | -1, asicgap = 2) {
    // check
    if (frame.length != FRAME_LEN) return;
    if (asicgap < 0) return;

    // copy
    let [oW, oH] = firstpos;
    let buffer = new Uint32Array(image.data.buffer);
    let [width, height] = [image.width, image.height];
    for (let i = 0; i < FRAME_LEN; i++) {
        let px = frame[i];
        let frmH = i % 128;
        let frmW = Math.floor(i / 128);
        let frmB = Math.floor(frmW / 64);
        frmW += asicgap * frmB;
        let imgW = oW - rot * frmW;
        let imgH = oH + rot * frmH;
        if (imgW >= 0 && imgW < width && imgH >= 0 && imgH < height) {
            buffer[imgH * width + imgW] = getColor(px);
        }
    }
}

var colorTable = generateColorTable();

function getColor(px: number): number {
    if (px > 255) {
        return 0;
    } else {
        return colorTable[px];
    }
}
