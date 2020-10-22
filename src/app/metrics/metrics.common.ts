type MetricsOverview = {};

export enum MetricsType {
    sender = 'sender',
    combiner = 'combiner',
    dispatcher = 'dispatcher',
    ingester = 'ingester',
    monitor = 'monitor',
    controller = 'controller',
    none = 'none',
}

export type MetricsData = {
    type: MetricsType;
    metrics: any;
    selected: { [parameter: string]: { [instance: string]: [number, number][] } };
};

export enum MetricsCommand {
    select = 'select',
    setinterval = 'setinterval',
}
