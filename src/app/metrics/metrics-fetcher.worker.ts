/// <reference lib="webworker" />

import { interval, Subscription } from 'rxjs';
import { MetricsType } from './metrics-type.enum';
import { MetricsCommand } from './metrics-command.enum';
import { MetricsData } from './metrics-data.type';

const configUrl: string = 'assets/config.json';
let selectedComponent: MetricsType;
let intervalSubscription: Subscription;
let intervalTime: number = 1000;

let senderMetrics: MetricsData = { type: MetricsType.sender, metrics: {}, selected: { rate1: [], rate2: [] } };

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

function update(count: number): void {
    console.log('update: ', count);

    // fetch and update
    senderMetrics.selected.rate1 = [];
    senderMetrics.selected.rate2 = [];
    let currentTime = new Date().getTime();
    for (let i = 0; i <= 60; i++) {
        senderMetrics.selected.rate1.push([currentTime - i * 1000, 1.5 + Math.sin((i - count * 0.5) / 5)]);
        senderMetrics.selected.rate2.push([currentTime - i * 1000, 1.5 + Math.cos((i - count * 0.5) / 5)]);
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
