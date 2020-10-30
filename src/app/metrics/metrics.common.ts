export enum MetricsType {
    sender = 'sender',
    combiner = 'combiner',
    dispatcher = 'dispatcher',
    ingester = 'ingester',
    monitor = 'monitor',
    controller = 'controller',
    overview = 'overview',
    none = 'none',
}

export type MetricsOverview = {
    type: MetricsType;
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
    type: MetricsType;
    metrics: any;
    selected: {
        [parameter: string]: {
            unit: string;
            data: { [instance: string]: [number, number][] };
        } | null;
    };
};

export enum MetricsCommand {
    select = 'select',
    setinterval = 'setinterval',
}
