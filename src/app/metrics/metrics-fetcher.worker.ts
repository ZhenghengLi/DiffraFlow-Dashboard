/// <reference lib="webworker" />

import { interval, Subscription } from 'rxjs';
import { MetricsType, MetricsCommand, MetricsData } from './metrics.common';

const maxArrLen = 63;

//=============================================================================
// metrics data processing logics

// ---- overview --------------------------------------------------------------

let overviewMetrics: MetricsData = {
    type: MetricsType.overview,
    metrics: { count: 0 },
    selected: { dataRate: { unit: 'Rate (MiB/s)', data: { instance1: [], instance2: [] } } },
};

function processOverviewMetrics(count: number, data: any): void {
    overviewMetrics.metrics.count = count;
}

// ---- sender ----------------------------------------------------------------

let senderMetrics: MetricsData = {
    type: MetricsType.sender,
    metrics: {},
    selected: {
        sendFrameRate: { unit: 'Frame Rate (fps)', data: {} },
        tcpPacketRate: { unit: 'Packet Rate (pps)', data: {} },
        tcpDataRate: { unit: 'Data Rate (MiB/s)', data: {} },
        udpPacketRate: { unit: 'Packet Rate (pps)', data: {} },
        udpDataRate: { unit: 'Data Rate (MiB/s)', data: {} },
    },
};

let senderMetricsHistory: any = {
    sendFrameTotal: {},
    tcpPacketTotal: {},
    tcpDataTotal: {},
    udpPacketTotal: {},
    udpDataTotal: {},
};

function processSenderMetrics(count: number, data: any): void {
    senderMetrics.metrics = data;

    for (let instance in data) {
        let timestamp = data[instance].timestamp;
        let transfer_stat = data[instance].data_transfer?.transfer_stat;
        // frame rate
        if (transfer_stat) {
            let currentHist = senderMetricsHistory.sendFrameTotal[instance]
                ? senderMetricsHistory.sendFrameTotal[instance]
                : (senderMetricsHistory.sendFrameTotal[instance] = { timestamp, data: [] });
            if (timestamp > currentHist.timestamp) {
                currentHist.timestamp = timestamp;
                currentHist.data.push([timestamp, transfer_stat.send_succ_counts]);
                if (currentHist.data.length > maxArrLen) {
                    currentHist.data.shift();
                }
                senderMetrics.selected.sendFrameRate.data[instance] = calculate_rate(currentHist.data);
            }
        }
        // tcp
        let tcp_network_stats = data[instance].data_transfer?.tcp_sender_stat?.network_stats;
        if (tcp_network_stats) {
            //
        }
        // udp
        let udp_dgram_stats = data[instance].data_transfer?.udp_sender_stat?.dgram_stats;
        if (udp_dgram_stats) {
            //
        }
    }
}

// ---- dispatcher ------------------------------------------------------------

let dispatcherMetrics: MetricsData = {
    type: MetricsType.dispatcher,
    metrics: {},
    selected: { dataRate: { unit: 'Rate (MiB/s)', data: { instance1: [], instance2: [] } } },
    // selected: { dataRate: null },
};

function processDispatcherMetrics(count: number, data: any): void {
    dispatcherMetrics.metrics = data;

    // extract selected parameters
}

// ---- combiner --------------------------------------------------------------

let combinerMetrics: MetricsData = {
    type: MetricsType.combiner,
    metrics: {},
    selected: { dataRate: { unit: 'Rate (MiB/s)', data: { instance1: [], instance2: [] } } },
    // selected: { dataRate: null },
};

function processCombinerMetrics(count: number, data: any): void {
    combinerMetrics.metrics = data;

    // extract selected parameters
}

// ---- ingester --------------------------------------------------------------

let ingesterMetrics: MetricsData = {
    type: MetricsType.ingester,
    metrics: {},
    selected: { dataRate: { unit: 'Rate (MiB/s)', data: { instance1: [], instance2: [] } } },
    // selected: { dataRate: null },
};

function processIngesterMetrics(count: number, data: any): void {
    ingesterMetrics.metrics = data;

    // extract selected parameters
}

// ---- monitor ---------------------------------------------------------------

let monitorMetrics: MetricsData = {
    type: MetricsType.monitor,
    metrics: {},
    selected: { dataRate: { unit: 'Rate (MiB/s)', data: { instance1: [], instance2: [] } } },
    // selected: { dataRate: null },
};

function processMonitorMetrics(count: number, data: any): void {
    monitorMetrics.metrics = data;

    // extract selected parameters
}

// ---- controller ------------------------------------------------------------

let controllerMetrics: MetricsData = {
    type: MetricsType.controller,
    metrics: {},
    selected: { dataRate: { unit: 'Rate (MiB/s)', data: { instance1: [], instance2: [] } } },
    // selected: { dataRate: null },
};

function processControllerMetrics(count: number, data: any): void {
    controllerMetrics.metrics = data;

    // extract selected parameters
}

// ============================================================================

function update(count: number, data: any): void {
    console.log('update: ', count);

    processOverviewMetrics(count, data);
    processSenderMetrics(count, data[MetricsType.sender]);
    processDispatcherMetrics(count, data[MetricsType.dispatcher]);
    processCombinerMetrics(count, data[MetricsType.combiner]);
    processIngesterMetrics(count, data[MetricsType.ingester]);
    processMonitorMetrics(count, data[MetricsType.monitor]);
    processControllerMetrics(count, data[MetricsType.controller]);

    // post message
    switch (selectedComponent) {
        case MetricsType.overview:
            console.log('post:', MetricsType.overview);
            postMessage(overviewMetrics);
            break;
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
        default:
            console.log('post:', MetricsType.none);
    }
}

//=============================================================================
// common functions
function calculate_rate(data: [number, number][]): [number, number][] {
    let rateList = [];
    if (data.length > 2) {
        for (let i = 0; i < data.length - 2; i++) {
            let [t1, d1, t2, d2] = [data[i][0], data[i][1], data[i + 2][0], data[i + 2][1]];
            rateList.push([(t1 + t2) / 2, ((d2 - d1) * 1000) / (t2 - t1)]);
        }
    }
    return rateList;
}

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
