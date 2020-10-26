type MetricsOverview = {};

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
