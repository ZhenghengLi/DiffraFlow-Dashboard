export enum MetricsType {
    overview = 'overview',
    sender = 'sender',
    combiner = 'combiner',
    dispatcher = 'dispatcher',
    ingester = 'ingester',
    monitor = 'monitor',
    controller = 'controller',
}

export type MetricsOverview = {
    update_timestamp: number;
    update_timestamp_unit: string;
    aggregated: {
        [parameter: string]: number;
    };
    history: {
        [parameter: string]: {
            unit: string;
            data: [number, number][];
        };
    };
};

export type MetricsData = {
    metrics: any;
    selected: {
        [parameter: string]: {
            unit: string;
            data: { [instance: string]: [number, number][] };
        } | null;
    };
};

export type MetricsGroup = {
    updateTimestamp: number;
    [MetricsType.overview]: MetricsOverview;
    [MetricsType.sender]: MetricsData;
    [MetricsType.dispatcher]: MetricsData;
    [MetricsType.combiner]: MetricsData;
    [MetricsType.ingester]: MetricsData;
    [MetricsType.monitor]: MetricsData;
    [MetricsType.controller]: MetricsData;
};

export enum MetricsCommand {
    setinterval = 'setinterval',
}
