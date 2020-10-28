/// <reference lib="webworker" />

import { interval, Subscription } from 'rxjs';
import { MetricsType, MetricsCommand, MetricsData } from './metrics.common';

const rateStep = 1;
const maxArrLen = 61 + rateStep;

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
    lastTimestamp: {},
    sendFrameTotal: {},
    tcpPacketTotal: {},
    tcpDataTotal: {},
    udpPacketTotal: {},
    udpDataTotal: {},
};

function processSenderMetrics(count: number, data: any): void {
    senderMetrics.metrics = data;

    for (let instance in data) {
        // check timestamp
        let currentTimestamp = data[instance].timestamp;
        let lastTimestamp = senderMetricsHistory.lastTimestamp[instance]
            ? senderMetricsHistory.lastTimestamp[instance]
            : (senderMetricsHistory.lastTimestamp[instance] = 1);
        if (currentTimestamp > lastTimestamp) {
            senderMetricsHistory.lastTimestamp[instance] = currentTimestamp;
        } else {
            continue;
        }

        // frame rate
        let transfer_stat = data[instance].data_transfer?.transfer_stat;
        if (transfer_stat) {
            let currentFrmHist = senderMetricsHistory.sendFrameTotal[instance]
                ? senderMetricsHistory.sendFrameTotal[instance]
                : (senderMetricsHistory.sendFrameTotal[instance] = []);
            currentFrmHist.push([currentTimestamp, transfer_stat.send_succ_counts]);
            if (currentFrmHist.length > maxArrLen) currentFrmHist.shift();
            senderMetrics.selected.sendFrameRate.data[instance] = calculate_rate(currentFrmHist);
        }

        // tcp
        let tcp_network_stats = data[instance].data_transfer?.tcp_sender_stat?.network_stats;
        if (tcp_network_stats) {
            // packet rate
            let currentPktHist = senderMetricsHistory.tcpPacketTotal[instance]
                ? senderMetricsHistory.tcpPacketTotal[instance]
                : (senderMetricsHistory.tcpPacketTotal[instance] = []);
            currentPktHist.push([currentTimestamp, tcp_network_stats.total_sent_counts]);
            if (currentPktHist.length > maxArrLen) currentPktHist.shift();
            senderMetrics.selected.tcpPacketRate.data[instance] = calculate_rate(currentPktHist);
            // data rate
            let currentDatHist = senderMetricsHistory.tcpDataTotal[instance]
                ? senderMetricsHistory.tcpDataTotal[instance]
                : (senderMetricsHistory.tcpDataTotal[instance] = []);
            currentDatHist.push([currentTimestamp, tcp_network_stats.total_sent_size / 1024 / 1024]);
            if (currentDatHist.length > maxArrLen) currentDatHist.shift();
            senderMetrics.selected.tcpDataRate.data[instance] = calculate_rate(currentDatHist);
        }

        // udp
        let udp_dgram_stats = data[instance].data_transfer?.udp_sender_stat?.dgram_stats;
        if (udp_dgram_stats) {
            // packet rate
            let currentPktHist = senderMetricsHistory.udpPacketTotal[instance]
                ? senderMetricsHistory.udpPacketTotal[instance]
                : (senderMetricsHistory.udpPacketTotal[instance] = []);
            currentPktHist.push([currentTimestamp, udp_dgram_stats.total_succ_count]);
            if (currentPktHist.length > maxArrLen) currentPktHist.shift();
            senderMetrics.selected.udpPacketRate.data[instance] = calculate_rate(currentPktHist);
            // data rate
            let currentDatHist = senderMetricsHistory.udpDataTotal[instance]
                ? senderMetricsHistory.udpDataTotal[instance]
                : (senderMetricsHistory.udpDataTotal[instance] = []);
            currentDatHist.push([currentTimestamp, udp_dgram_stats.total_succ_size / 1024 / 1024]);
            if (currentDatHist.length > maxArrLen) currentDatHist.shift();
            senderMetrics.selected.udpDataRate.data[instance] = calculate_rate(currentDatHist);
        }
    }
}

// ---- dispatcher ------------------------------------------------------------

let dispatcherMetrics: MetricsData = {
    type: MetricsType.dispatcher,
    metrics: {},
    selected: {
        tcpPacketRate: { unit: 'Packet Rate (pps)', data: {} },
        tcpDataRate: { unit: 'Data Rate (MiB/s)', data: {} },
        udpPacketRate: { unit: 'Packet Rate (pps)', data: {} },
        udpDataRate: { unit: 'Data Rate (MiB/s)', data: {} },
        udpFrameRateChecked: { unit: 'Frame Rate (fps)', data: {} },
        udpFrameRateAll: { unit: 'Frame Rate (fps)', data: {} },
        sendPacketRate: { unit: 'Packet Rate (pps)', data: {} },
        sendDataRate: { unit: 'Data Rate (MiB/s)', data: {} },
    },
};

let dispatcherMetricsHistory: any = {
    lastTimestamp: {},
    tcpPacketTotal: {},
    tcpDataTotal: {},
    udpPacketTotal: {},
    udpDataTotal: {},
    udpFrameTotalChecked: {},
    udpFrameTotalAll: {},
    sendPacketTotal: {},
    sendDataTotal: {},
};

function processDispatcherMetrics(count: number, data: any): void {
    dispatcherMetrics.metrics = data;

    for (let instance in data) {
        // check timestamp
        let currentTimestamp = data[instance].timestamp;
        let lastTimestamp = dispatcherMetricsHistory.lastTimestamp[instance]
            ? dispatcherMetricsHistory.lastTimestamp[instance]
            : (dispatcherMetricsHistory.lastTimestamp[instance] = 1);
        if (currentTimestamp > lastTimestamp) {
            senderMetricsHistory.lastTimestamp[instance] = currentTimestamp;
        } else {
            continue;
        }

        // dgram
        let dgram_stats = data[instance].image_frame_udp_receiver?.dgram_stats;
        if (dgram_stats) {
            // packet
            let currentPktHist = dispatcherMetricsHistory.udpPacketTotal[instance]
                ? dispatcherMetricsHistory.udpPacketTotal[instance]
                : (dispatcherMetricsHistory.udpPacketTotal[instance] = []);
            currentPktHist.push([currentTimestamp, dgram_stats.total_recv_count]);
            if (currentPktHist.length > maxArrLen) currentPktHist.shift();
            dispatcherMetrics.selected.udpPacketRate.data[instance] = calculate_rate(currentPktHist);
            // data
            let currentDatHist = dispatcherMetricsHistory.udpDataTotal[instance]
                ? dispatcherMetricsHistory.udpDataTotal[instance]
                : (dispatcherMetricsHistory.udpDataTotal[instance] = []);
            currentDatHist.push([currentTimestamp, dgram_stats.total_recv_size / 1024 / 1024]);
            if (currentDatHist.length > maxArrLen) currentDatHist.shift();
            dispatcherMetrics.selected.udpDataRate.data[instance] = calculate_rate(currentDatHist);
        }

        // udp frame
        let frame_stats = data[instance].image_frame_udp_receiver?.frame_stats;
        if (frame_stats) {
            // checked
            let currentFrmChkHist = dispatcherMetricsHistory.udpFrameTotalChecked[instance]
                ? dispatcherMetricsHistory.udpFrameTotalChecked[instance]
                : (dispatcherMetricsHistory.udpFrameTotalChecked[instance] = []);
            currentFrmChkHist.push([currentTimestamp, frame_stats.total_checked_count]);
            if (currentFrmChkHist.length > maxArrLen) currentFrmChkHist.shift();
            dispatcherMetrics.selected.udpFrameRateChecked.data[instance] = calculate_rate(currentFrmChkHist);
            // all
            let currentFrmAllHist = dispatcherMetricsHistory.udpFrameTotalAll[instance]
                ? dispatcherMetricsHistory.udpFrameTotalAll[instance]
                : (dispatcherMetricsHistory.udpFrameTotalAll[instance] = []);
            currentFrmAllHist.push([currentTimestamp, frame_stats.total_received_count]);
            if (currentFrmAllHist.length > maxArrLen) currentFrmAllHist.shift();
            dispatcherMetrics.selected.udpFrameRateAll.data[instance] = calculate_rate(currentFrmAllHist);
        }

        // tcp
        let tcp_receiver = data[instance].image_frame_tcp_receiver;
        if (tcp_receiver) {
            // packet
            let currentPktHist = dispatcherMetricsHistory.tcpPacketTotal[instance]
                ? dispatcherMetricsHistory.tcpPacketTotal[instance]
                : (dispatcherMetricsHistory.tcpPacketTotal[instance] = []);
            let pkt_count_sum = 0;
            for (let conn of tcp_receiver) {
                pkt_count_sum += conn.network_stats.total_received_counts;
            }
            currentPktHist.push([currentTimestamp, pkt_count_sum]);
            if (currentPktHist.length > maxArrLen) currentPktHist.shift();
            dispatcherMetrics.selected.tcpPacketRate.data[instance] = calculate_rate(currentPktHist);
            // data
            let currentDatHist = dispatcherMetricsHistory.tcpDataTotal[instance]
                ? dispatcherMetricsHistory.tcpDataTotal[instance]
                : (dispatcherMetricsHistory.tcpDataTotal[instance] = []);
            let dat_size_sum = 0;
            for (let conn of tcp_receiver) {
                dat_size_sum += conn.network_stats.total_received_size;
            }
            currentDatHist.push([currentTimestamp, dat_size_sum / 1024 / 1024]);
            if (currentDatHist.length > maxArrLen) currentDatHist.shift();
            dispatcherMetrics.selected.tcpDataRate.data[instance] = calculate_rate(currentDatHist);
        }

        // sender
        let frame_senders = data[instance].image_frame_senders;
        if (frame_senders) {
            // packet
            let currentPktHist = dispatcherMetricsHistory.sendPacketTotal[instance]
                ? dispatcherMetricsHistory.sendPacketTotal[instance]
                : (dispatcherMetricsHistory.sendPacketTotal[instance] = []);
            let pkt_count_sum = 0;
            for (let conn of frame_senders) {
                pkt_count_sum += conn.network_stats.total_sent_counts;
            }
            currentPktHist.push([currentTimestamp, pkt_count_sum]);
            if (currentPktHist.length > maxArrLen) currentPktHist.shift();
            dispatcherMetrics.selected.sendPacketRate.data[instance] = calculate_rate(currentPktHist);
            // data
            let currentDatHist = dispatcherMetricsHistory.sendDataTotal[instance]
                ? dispatcherMetricsHistory.sendDataTotal[instance]
                : (dispatcherMetricsHistory.sendDataTotal[instance] = []);
            let dat_size_sum = 0;
            for (let conn of frame_senders) {
                dat_size_sum += conn.network_stats.total_sent_size;
            }
            currentDatHist.push([currentTimestamp, dat_size_sum / 1024 / 1024]);
            if (currentDatHist.length > maxArrLen) currentDatHist.shift();
            dispatcherMetrics.selected.sendDataRate.data[instance] = calculate_rate(currentDatHist);
        }
    }
}

// ---- combiner --------------------------------------------------------------

let combinerMetrics: MetricsData = {
    type: MetricsType.combiner,
    metrics: {},
    selected: {
        recvPacketRate: { unit: 'Packet Rate (pps)', data: {} },
        recvDataRate: { unit: 'Data Rate (MiB/s)', data: {} },
        imageAlignmentRate: { unit: 'Frame Rate (fps)', data: {} },
        lateArrivingRate: { unit: 'Frame Rate (fps)', data: {} },
        partialImageRate: { unit: 'Frame Rate (fps)', data: {} },
        imageTakingRate: { unit: 'Frame Rate (fps)', data: {} },
        imageSendingRate: { unit: 'Frame Rate (fps)', data: {} },
    },
};

let combinerMetricsHistory: any = {
    lastTimestamp: {},
    recvPacketTotal: {},
    recvDataTotal: {},
    imageAlignmentTotal: {},
    lateArrivingTotal: {},
    partialImageTotal: {},
    imageTakingTotal: {},
    imageSendingTotal: {},
};

function processCombinerMetrics(count: number, data: any): void {
    combinerMetrics.metrics = data;

    for (let instance in data) {
        // check timestamp
        let currentTimestamp = data[instance].timestamp;
        let lastTimestamp = combinerMetricsHistory.lastTimestamp[instance]
            ? combinerMetricsHistory.lastTimestamp[instance]
            : (combinerMetricsHistory.lastTimestamp[instance] = 1);
        if (currentTimestamp > lastTimestamp) {
            senderMetricsHistory.lastTimestamp[instance] = currentTimestamp;
        } else {
            continue;
        }

        // frame_server
        let frame_server = data[instance].image_frame_server;
        if (frame_server) {
            // packet
            let currentPktHist = combinerMetricsHistory.recvPacketTotal[instance]
                ? combinerMetricsHistory.recvPacketTotal[instance]
                : (combinerMetricsHistory.recvPacketTotal[instance] = []);
            let pkt_count_sum = 0;
            for (let conn of frame_server) {
                pkt_count_sum += conn.network_stats.total_received_counts;
            }
            currentPktHist.push([currentTimestamp, pkt_count_sum]);
            if (currentPktHist.length > maxArrLen) currentPktHist.shift();
            combinerMetrics.selected.recvPacketRate.data[instance] = calculate_rate(currentPktHist);

            // data
            let currentDatHist = combinerMetricsHistory.recvDataTotal[instance]
                ? combinerMetricsHistory.recvDataTotal[instance]
                : (combinerMetricsHistory.recvDataTotal[instance] = []);
            let dat_size_sum = 0;
            for (let conn of frame_server) {
                dat_size_sum += conn.network_stats.total_received_size;
            }
            currentDatHist.push([currentTimestamp, dat_size_sum / 1024 / 1024]);
            if (currentDatHist.length > maxArrLen) currentDatHist.shift();
            combinerMetrics.selected.recvDataRate.data[instance] = calculate_rate(currentDatHist);
        }

        // alignment
        let alignment_stats = data[instance].image_cache?.alignment_stats;
        if (alignment_stats) {
            // total_aligned_images
            let currentAlignHist = combinerMetricsHistory.imageAlignmentTotal[instance]
                ? combinerMetricsHistory.imageAlignmentTotal[instance]
                : (combinerMetricsHistory.imageAlignmentTotal[instance] = []);
            currentAlignHist.push([currentTimestamp, alignment_stats.total_aligned_images]);
            if (currentAlignHist.length > maxArrLen) currentAlignHist.shift();
            combinerMetrics.selected.imageAlignmentRate.data[instance] = calculate_rate(currentAlignHist);

            // total_late_arrived
            let currentLateHist = combinerMetricsHistory.lateArrivingTotal[instance]
                ? combinerMetricsHistory.lateArrivingTotal[instance]
                : (combinerMetricsHistory.lateArrivingTotal[instance] = []);
            currentLateHist.push([currentTimestamp, alignment_stats.total_late_arrived]);
            if (currentLateHist.length > maxArrLen) currentLateHist.shift();
            combinerMetrics.selected.lateArrivingRate.data[instance] = calculate_rate(currentLateHist);

            // total_partial_images
            let currentPartHist = combinerMetricsHistory.partialImageTotal[instance]
                ? combinerMetricsHistory.partialImageTotal[instance]
                : (combinerMetricsHistory.partialImageTotal[instance] = []);
            currentPartHist.push([currentTimestamp, alignment_stats.total_partial_images]);
            if (currentPartHist.length > maxArrLen) currentPartHist.shift();
            combinerMetrics.selected.partialImageRate.data[instance] = calculate_rate(currentPartHist);
        }

        // image takine
        let queue_stats = data[instance].image_cache?.queue_stats;
        if (queue_stats) {
            let currentCntHist = combinerMetricsHistory.imageTakingTotal[instance]
                ? combinerMetricsHistory.imageTakingTotal[instance]
                : (combinerMetricsHistory.imageTakingTotal[instance] = []);
            currentCntHist.push([currentTimestamp, queue_stats.image_data_queue_take_counts]);
            if (currentCntHist.length > maxArrLen) currentCntHist.shift();
            combinerMetrics.selected.imageTakingRate.data[instance] = calculate_rate(currentCntHist);
        }

        // image sending
        let image_data_server = data[instance].image_data_server;
        if (image_data_server) {
            let currentCntHist = combinerMetricsHistory.imageSendingTotal[instance]
                ? combinerMetricsHistory.imageSendingTotal[instance]
                : (combinerMetricsHistory.imageSendingTotal[instance] = []);
            let img_count_sum = 0;
            for (let conn of image_data_server) {
                img_count_sum += conn.image_stats.total_sent_images;
            }
            currentCntHist.push([currentTimestamp, img_count_sum]);
            if (currentCntHist.length > maxArrLen) currentCntHist.shift();
            combinerMetrics.selected.imageSendingRate.data[instance] = calculate_rate(currentCntHist);
        }
    }
}

// ---- ingester --------------------------------------------------------------

let ingesterMetrics: MetricsData = {
    type: MetricsType.ingester,
    metrics: {},
    selected: {
        recvImageRate: { unit: 'Frame Rate (fps)', data: {} },
        recvDataRate: { unit: 'Data Rate (MiB/s)', data: {} },
        processedImageRate: { unit: 'Frame Rate (fps)', data: {} },
        monitoringImageRate: { unit: 'Frame Rate (fps)', data: {} },
        savingImageRate: { unit: 'Frame Rate (fps)', data: {} },
        savedImageRate: { unit: 'Frame Rate (fps)', data: {} },
        imageRequestRate: { unit: 'Request Rate (rps)', data: {} },
        imageSendRate: { unit: 'Frame Rate (fps)', data: {} },
    },
};

let ingesterMetricsHistory: any = {
    lastTimestamp: {},
    recvImageTotal: {},
    recvDataTotal: {},
    processedImageTotal: {},
    monitoringImageTotal: {},
    savingImageTotal: {},
    savedImageTotal: {},
    imageRequestTotal: {},
    imageSendTotal: {},
};

function processIngesterMetrics(count: number, data: any): void {
    ingesterMetrics.metrics = data;

    for (let instance in data) {
        // check timestamp
        let currentTimestamp = data[instance].timestamp;
        let lastTimestamp = ingesterMetricsHistory.lastTimestamp[instance]
            ? ingesterMetricsHistory.lastTimestamp[instance]
            : (ingesterMetricsHistory.lastTimestamp[instance] = 1);
        if (currentTimestamp > lastTimestamp) {
            senderMetricsHistory.lastTimestamp[instance] = currentTimestamp;
        } else {
            continue;
        }

        // frame_server
    }
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
    if (data.length > rateStep) {
        for (let i = 0; i < data.length - rateStep; i++) {
            let [t1, d1, t2, d2] = [data[i][0], data[i][1], data[i + rateStep][0], data[i + rateStep][1]];
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
