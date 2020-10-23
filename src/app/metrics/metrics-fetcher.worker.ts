/// <reference lib="webworker" />

import { interval, Subscription } from 'rxjs';
import { MetricsType, MetricsCommand, MetricsData } from './metrics.common';

const configUrl: string = 'assets/config.json';
let selectedComponent: MetricsType;
let intervalSubscription: Subscription;
let intervalTime: number = 1000;

let senderMetrics: MetricsData = {
    type: MetricsType.sender,
    metrics: {
        config: { par1: 123, par2: 456 },
        network: {
            host:
                'localhost===========================================================================================================',
            port: 27000,
        },
        count: 0,
    },
    selected: { dataRate: { unit: 'Rate (MiB/s)', data: { instance1: [], instance2: [] } } },
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

    senderMetrics.metrics.count = count;

    // fetch and update
    senderMetrics.selected.dataRate.data.instance1 = [];
    senderMetrics.selected.dataRate.data.instance2 = [];
    if (count % 10 === 0 && globalInstanceNum < 16) {
        globalInstanceNum++;
        senderMetrics.selected.dataRate.data['instance' + globalInstanceNum] = [];
    }
    let currentTime = new Date().getTime();
    for (let key in senderMetrics.selected.dataRate.data) {
        senderMetrics.selected.dataRate.data[key] = [];
        for (let i = 0; i <= 60; i++) {
            senderMetrics.selected.dataRate.data[key].push([
                currentTime - i * 1000,
                1.5 + Math.sin((i - count * 0.5) / 5),
            ]);
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
