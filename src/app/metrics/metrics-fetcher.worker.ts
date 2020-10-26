/// <reference lib="webworker" />

import { interval, Subscription } from 'rxjs';
import { MetricsType, MetricsCommand, MetricsData } from './metrics.common';

//=============================================================================
// metrics data processing logics

// ---- global metrics data ---------------------------------------------------

let overviewMetrics: MetricsData = {
    type: MetricsType.overview,
    metrics: { count: 123 },
    selected: { dataRate: { unit: 'Rate (MiB/s)', data: { instance1: [], instance2: [] } } },
};

let senderMetrics: MetricsData = {
    type: MetricsType.sender,
    metrics: {},
    selected: { dataRate: { unit: 'Rate (MiB/s)', data: { instance1: [], instance2: [] } } },
    // selected: { dataRate: null },
};

let dispatcherMetrics: MetricsData = {
    type: MetricsType.dispatcher,
    metrics: {},
    selected: { dataRate: { unit: 'Rate (MiB/s)', data: { instance1: [], instance2: [] } } },
    // selected: { dataRate: null },
};

let combinerMetrics: MetricsData = {
    type: MetricsType.combiner,
    metrics: {},
    selected: { dataRate: { unit: 'Rate (MiB/s)', data: { instance1: [], instance2: [] } } },
    // selected: { dataRate: null },
};

let ingesterMetrics: MetricsData = {
    type: MetricsType.ingester,
    metrics: {},
    selected: { dataRate: { unit: 'Rate (MiB/s)', data: { instance1: [], instance2: [] } } },
    // selected: { dataRate: null },
};

let monitorMetrics: MetricsData = {
    type: MetricsType.monitor,
    metrics: {},
    selected: { dataRate: { unit: 'Rate (MiB/s)', data: { instance1: [], instance2: [] } } },
    // selected: { dataRate: null },
};

let controllerMetrics: MetricsData = {
    type: MetricsType.controller,
    metrics: {},
    selected: { dataRate: { unit: 'Rate (MiB/s)', data: { instance1: [], instance2: [] } } },
    // selected: { dataRate: null },
};

// ---- metrics processing functions ------------------------------------------

function processSenderMetrics(count: number, data: any): void {
    senderMetrics.metrics = data;

    // extract selected parameters
}

function processDispatcherMetrics(count: number, data: any): void {
    dispatcherMetrics.metrics = data;

    // extract selected parameters
}

function processCombinerMetrics(count: number, data: any): void {
    combinerMetrics.metrics = data;

    // extract selected parameters
}

function processIngesterMetrics(count: number, data: any): void {
    ingesterMetrics.metrics = data;

    // extract selected parameters
}

function processMonitorMetrics(count: number, data: any): void {
    monitorMetrics.metrics = data;

    // extract selected parameters
}

function processControllerMetrics(count: number, data: any): void {
    controllerMetrics.metrics = data;

    // extract selected parameters
}

// ----------------------------------------------------------------------------

function update(count: number, data: any): void {
    console.log('update: ', count);

    processSenderMetrics(count, data[MetricsType.sender]);
    processDispatcherMetrics(count, data[MetricsType.dispatcher]);
    processCombinerMetrics(count, data[MetricsType.combiner]);
    processIngesterMetrics(count, data[MetricsType.ingester]);
    processMonitorMetrics(count, data[MetricsType.monitor]);
    processControllerMetrics(count, data[MetricsType.controller]);

    // post message
    switch (selectedComponent) {
        case MetricsType.sender:
            console.log('post:', MetricsType.sender);
            postMessage(senderMetrics);
            break;
        case MetricsType.dispatcher:
            console.log('post:', MetricsType.dispatcher);
            postMessage(dispatcherMetrics);
            break;
        case MetricsType.combiner:
            console.log('post:', MetricsType.combiner);
            postMessage(combinerMetrics);
            break;
        case MetricsType.ingester:
            console.log('post:', MetricsType.ingester);
            postMessage(ingesterMetrics);
            break;
        case MetricsType.monitor:
            console.log('post:', MetricsType.monitor);
            postMessage(monitorMetrics);
            break;
        case MetricsType.controller:
            console.log('post:', MetricsType.controller);
            postMessage(controllerMetrics);
            break;
        case MetricsType.overview:
            console.log('post:', MetricsType.overview);
            postMessage(overviewMetrics);
            break;
        default:
            console.log('post:', MetricsType.none);
    }
}

//=============================================================================
// common functions

//=============================================================================
// management functions

const configUrl: string = 'assets/config.json';
let selectedComponent: MetricsType;
let intervalSubscription: Subscription;

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
            let aggregatorAddress = data.aggregator_address;
            console.log(aggregatorAddress);
            if (!aggregatorAddress) {
                throw new Error('there is no aggregator_address in config');
            }
            intervalSubscription?.unsubscribe();
            intervalSubscription = undefined;
            intervalSubscription = interval(intervalTime).subscribe((count) => {
                fetch('http://' + aggregatorAddress)
                    .then((response) => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            throw new Error(`cannot fetch metrics from ${configUrl}`);
                        }
                    })
                    .then((data) => {
                        update(count, data);
                    })
                    .catch((err) => console.error(err));
            });
        })
        .catch((err) => console.error(err));
}

setIntervalTime(1000);
