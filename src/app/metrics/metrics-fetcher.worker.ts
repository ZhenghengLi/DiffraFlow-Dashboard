/// <reference lib="webworker" />

import { interval, Subscription } from 'rxjs';
import { MetricsType, MetricsCommand, MetricsData } from './metrics.common';

const configUrl: string = 'assets/config.json';
let selectedComponent: MetricsType;
let intervalSubscription: Subscription;
let intervalTime: number = 1000;

let senderMetrics: MetricsData = {
    type: MetricsType.sender,
    metrics: {},
    selected: { dataRate: { instance1: [], instance2: [] } },
};

function setIntervalTime(time: number): void {
    let intervalTime = time > 500 ? time : 500;
    fetch(configUrl)
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(`cannot fetch addresses from ${configUrl}`);
            }
        })
        .then((data) => {
            let aggregatorAddress = data?.aggregator_address;
            console.log(aggregatorAddress);
            intervalSubscription?.unsubscribe();
            intervalSubscription = undefined;
            intervalSubscription = interval(intervalTime).subscribe((count) => update(count));
        })
        .catch((err) => console.log(err));
}

let globalInstanceNum = 2;

function update(count: number): void {
    console.log('update: ', count);

    // fetch and update
    senderMetrics.selected.dataRate.instance1 = [];
    senderMetrics.selected.dataRate.instance2 = [];
    if (count % 10 === 0 && globalInstanceNum < 16) {
        globalInstanceNum++;
        senderMetrics.selected.dataRate['instance' + globalInstanceNum] = [];
    }
    let currentTime = new Date().getTime();
    for (let key in senderMetrics.selected.dataRate) {
        senderMetrics.selected.dataRate[key] = [];
        for (let i = 0; i <= 60; i++) {
            senderMetrics.selected.dataRate[key].push([currentTime - i * 1000, 1.5 + Math.sin((i - count * 0.5) / 5)]);
        }
    }

    // post message
    switch (selectedComponent) {
        case MetricsType.sender:
            console.log(MetricsType.sender);
            postMessage(senderMetrics);
            break;
    }
}

onmessage = ({ data }) => {
    console.log('received message: ', data);
    switch (data.command) {
        case MetricsCommand.select:
            selectedComponent = data.payload;
            console.log('selectedComponent = ', selectedComponent);
            break;
        case MetricsCommand.setinterval:
            setIntervalTime(data.payload);
            console.log('setIntervalTime: ', data.payload);
            break;
        default:
            break;
    }
};

setIntervalTime(1000);
