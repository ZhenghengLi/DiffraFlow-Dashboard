/// <reference lib="webworker" />

import { interval, Subscription } from 'rxjs';
import { MetricsType, MetricsCommand, MetricsData } from './metrics.common';

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
            update_hist(currentFrmHist, [currentTimestamp, transfer_stat.send_succ_counts]);
            senderMetrics.selected.sendFrameRate.data[instance] = calculate_rate(currentFrmHist);
        }

        // tcp
        let tcp_network_stats = data[instance].data_transfer?.tcp_sender_stat?.network_stats;
        if (tcp_network_stats) {
            // packet rate
            let currentPktHist = senderMetricsHistory.tcpPacketTotal[instance]
                ? senderMetricsHistory.tcpPacketTotal[instance]
                : (senderMetricsHistory.tcpPacketTotal[instance] = []);
            update_hist(currentPktHist, [currentTimestamp, tcp_network_stats.total_sent_counts]);
            senderMetrics.selected.tcpPacketRate.data[instance] = calculate_rate(currentPktHist);
            // data rate
            let currentDatHist = senderMetricsHistory.tcpDataTotal[instance]
                ? senderMetricsHistory.tcpDataTotal[instance]
                : (senderMetricsHistory.tcpDataTotal[instance] = []);
            update_hist(currentDatHist, [currentTimestamp, tcp_network_stats.total_sent_size / 1024 / 1024]);
            senderMetrics.selected.tcpDataRate.data[instance] = calculate_rate(currentDatHist);
        }

        // udp
        let udp_dgram_stats = data[instance].data_transfer?.udp_sender_stat?.dgram_stats;
        if (udp_dgram_stats) {
            // packet rate
            let currentPktHist = senderMetricsHistory.udpPacketTotal[instance]
                ? senderMetricsHistory.udpPacketTotal[instance]
                : (senderMetricsHistory.udpPacketTotal[instance] = []);
            update_hist(currentPktHist, [currentTimestamp, udp_dgram_stats.total_succ_count]);
            senderMetrics.selected.udpPacketRate.data[instance] = calculate_rate(currentPktHist);
            // data rate
            let currentDatHist = senderMetricsHistory.udpDataTotal[instance]
                ? senderMetricsHistory.udpDataTotal[instance]
                : (senderMetricsHistory.udpDataTotal[instance] = []);
            update_hist(currentDatHist, [currentTimestamp, udp_dgram_stats.total_succ_size / 1024 / 1024]);
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
            update_hist(currentPktHist, [currentTimestamp, dgram_stats.total_recv_count]);
            dispatcherMetrics.selected.udpPacketRate.data[instance] = calculate_rate(currentPktHist);
            // data
            let currentDatHist = dispatcherMetricsHistory.udpDataTotal[instance]
                ? dispatcherMetricsHistory.udpDataTotal[instance]
                : (dispatcherMetricsHistory.udpDataTotal[instance] = []);
            update_hist(currentDatHist, [currentTimestamp, dgram_stats.total_recv_size / 1024 / 1024]);
            dispatcherMetrics.selected.udpDataRate.data[instance] = calculate_rate(currentDatHist);
        }

        // udp frame
        let frame_stats = data[instance].image_frame_udp_receiver?.frame_stats;
        if (frame_stats) {
            // checked
            let currentFrmChkHist = dispatcherMetricsHistory.udpFrameTotalChecked[instance]
                ? dispatcherMetricsHistory.udpFrameTotalChecked[instance]
                : (dispatcherMetricsHistory.udpFrameTotalChecked[instance] = []);
            update_hist(currentFrmChkHist, [currentTimestamp, frame_stats.total_checked_count]);
            dispatcherMetrics.selected.udpFrameRateChecked.data[instance] = calculate_rate(currentFrmChkHist);
            // all
            let currentFrmAllHist = dispatcherMetricsHistory.udpFrameTotalAll[instance]
                ? dispatcherMetricsHistory.udpFrameTotalAll[instance]
                : (dispatcherMetricsHistory.udpFrameTotalAll[instance] = []);
            update_hist(currentFrmAllHist, [currentTimestamp, frame_stats.total_received_count]);
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
            update_hist(currentPktHist, [currentTimestamp, pkt_count_sum]);
            dispatcherMetrics.selected.tcpPacketRate.data[instance] = calculate_rate(currentPktHist);
            // data
            let currentDatHist = dispatcherMetricsHistory.tcpDataTotal[instance]
                ? dispatcherMetricsHistory.tcpDataTotal[instance]
                : (dispatcherMetricsHistory.tcpDataTotal[instance] = []);
            let dat_size_sum = 0;
            for (let conn of tcp_receiver) {
                dat_size_sum += conn.network_stats.total_received_size;
            }
            update_hist(currentDatHist, [currentTimestamp, dat_size_sum / 1024 / 1024]);
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
            update_hist(currentPktHist, [currentTimestamp, pkt_count_sum]);
            dispatcherMetrics.selected.sendPacketRate.data[instance] = calculate_rate(currentPktHist);
            // data
            let currentDatHist = dispatcherMetricsHistory.sendDataTotal[instance]
                ? dispatcherMetricsHistory.sendDataTotal[instance]
                : (dispatcherMetricsHistory.sendDataTotal[instance] = []);
            let dat_size_sum = 0;
            for (let conn of frame_senders) {
                dat_size_sum += conn.network_stats.total_sent_size;
            }
            update_hist(currentDatHist, [currentTimestamp, dat_size_sum / 1024 / 1024]);
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
            update_hist(currentPktHist, [currentTimestamp, pkt_count_sum]);
            combinerMetrics.selected.recvPacketRate.data[instance] = calculate_rate(currentPktHist);

            // data
            let currentDatHist = combinerMetricsHistory.recvDataTotal[instance]
                ? combinerMetricsHistory.recvDataTotal[instance]
                : (combinerMetricsHistory.recvDataTotal[instance] = []);
            let dat_size_sum = 0;
            for (let conn of frame_server) {
                dat_size_sum += conn.network_stats.total_received_size;
            }
            update_hist(currentDatHist, [currentTimestamp, dat_size_sum / 1024 / 1024]);
            combinerMetrics.selected.recvDataRate.data[instance] = calculate_rate(currentDatHist);
        }

        // alignment
        let alignment_stats = data[instance].image_cache?.alignment_stats;
        if (alignment_stats) {
            // total_aligned_images
            let currentAlignHist = combinerMetricsHistory.imageAlignmentTotal[instance]
                ? combinerMetricsHistory.imageAlignmentTotal[instance]
                : (combinerMetricsHistory.imageAlignmentTotal[instance] = []);
            update_hist(currentAlignHist, [currentTimestamp, alignment_stats.total_aligned_images]);
            combinerMetrics.selected.imageAlignmentRate.data[instance] = calculate_rate(currentAlignHist);

            // total_late_arrived
            let currentLateHist = combinerMetricsHistory.lateArrivingTotal[instance]
                ? combinerMetricsHistory.lateArrivingTotal[instance]
                : (combinerMetricsHistory.lateArrivingTotal[instance] = []);
            update_hist(currentLateHist, [currentTimestamp, alignment_stats.total_late_arrived]);
            combinerMetrics.selected.lateArrivingRate.data[instance] = calculate_rate(currentLateHist);

            // total_partial_images
            let currentPartHist = combinerMetricsHistory.partialImageTotal[instance]
                ? combinerMetricsHistory.partialImageTotal[instance]
                : (combinerMetricsHistory.partialImageTotal[instance] = []);
            update_hist(currentPartHist, [currentTimestamp, alignment_stats.total_partial_images]);
            combinerMetrics.selected.partialImageRate.data[instance] = calculate_rate(currentPartHist);
        }

        // image takine
        let queue_stats = data[instance].image_cache?.queue_stats;
        if (queue_stats) {
            let currentCntHist = combinerMetricsHistory.imageTakingTotal[instance]
                ? combinerMetricsHistory.imageTakingTotal[instance]
                : (combinerMetricsHistory.imageTakingTotal[instance] = []);
            update_hist(currentCntHist, [currentTimestamp, queue_stats.image_data_queue_take_counts]);
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
            update_hist(currentCntHist, [currentTimestamp, img_count_sum]);
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

        // network_stats
        let network_stats = data[instance].image_data_fetcher?.network_stats;
        if (network_stats) {
            // packet rate
            let currentPktHist = ingesterMetricsHistory.recvImageTotal[instance]
                ? ingesterMetricsHistory.recvImageTotal[instance]
                : (ingesterMetricsHistory.recvImageTotal[instance] = []);
            update_hist(currentPktHist, [currentTimestamp, network_stats.total_received_counts]);
            ingesterMetrics.selected.recvImageRate.data[instance] = calculate_rate(currentPktHist);
            // data rate
            let currentDatHist = ingesterMetricsHistory.recvDataTotal[instance]
                ? ingesterMetricsHistory.recvDataTotal[instance]
                : (ingesterMetricsHistory.recvDataTotal[instance] = []);
            update_hist(currentDatHist, [currentTimestamp, network_stats.total_received_size / 1024 / 1024]);
            ingesterMetrics.selected.recvDataRate.data[instance] = calculate_rate(currentDatHist);
        }

        // image filter
        let image_filter = data[instance].image_filter;
        if (image_filter) {
            // processedImage
            let currentProHist = ingesterMetricsHistory.processedImageTotal[instance]
                ? ingesterMetricsHistory.processedImageTotal[instance]
                : (ingesterMetricsHistory.processedImageTotal[instance] = []);
            update_hist(currentProHist, [currentTimestamp, image_filter.total_processed_images]);
            ingesterMetrics.selected.processedImageRate.data[instance] = calculate_rate(currentProHist);
            // monitoringImage
            let currentMonHist = ingesterMetricsHistory.monitoringImageTotal[instance]
                ? ingesterMetricsHistory.monitoringImageTotal[instance]
                : (ingesterMetricsHistory.monitoringImageTotal[instance] = []);
            update_hist(currentMonHist, [currentTimestamp, image_filter.total_images_for_monitor]);
            ingesterMetrics.selected.monitoringImageRate.data[instance] = calculate_rate(currentMonHist);
            // savingImage
            let currentSavHist = ingesterMetricsHistory.savingImageTotal[instance]
                ? ingesterMetricsHistory.savingImageTotal[instance]
                : (ingesterMetricsHistory.savingImageTotal[instance] = []);
            update_hist(currentSavHist, [currentTimestamp, image_filter.total_images_for_save]);
            ingesterMetrics.selected.savingImageRate.data[instance] = calculate_rate(currentSavHist);
        }

        // image_writer
        let image_writer = data[instance].image_writer;
        if (image_writer) {
            // savedImage
            let currentCntHist = ingesterMetricsHistory.savedImageTotal[instance]
                ? ingesterMetricsHistory.savedImageTotal[instance]
                : (ingesterMetricsHistory.savedImageTotal[instance] = []);
            update_hist(currentCntHist, [currentTimestamp, image_writer.total_saved_counts]);
            ingesterMetrics.selected.savedImageRate.data[instance] = calculate_rate(currentCntHist);
        }

        // image_http_server
        let http_server = data[instance].image_http_server;
        if (http_server) {
            // imageRequest
            let currentReqHist = ingesterMetricsHistory.imageRequestTotal[instance]
                ? ingesterMetricsHistory.imageRequestTotal[instance]
                : (ingesterMetricsHistory.imageRequestTotal[instance] = []);
            update_hist(currentReqHist, [currentTimestamp, http_server.total_request_counts]);
            ingesterMetrics.selected.imageRequestRate.data[instance] = calculate_rate(currentReqHist);
            // imageSend
            let currentSndHist = ingesterMetricsHistory.imageSendTotal[instance]
                ? ingesterMetricsHistory.imageSendTotal[instance]
                : (ingesterMetricsHistory.imageSendTotal[instance] = []);
            update_hist(currentSndHist, [currentTimestamp, http_server.total_sent_counts]);
            ingesterMetrics.selected.imageSendRate.data[instance] = calculate_rate(currentSndHist);
        }
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

const rateStep = 1;
const maxTimeGap = (61 + rateStep) * 1000; // us

function update_hist(hist: [number, number][], item: [number, number]): void {
    hist.push(item);
    while (hist.slice(-1)[0][0] - hist[0][0] > maxTimeGap) hist.shift();
}

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
