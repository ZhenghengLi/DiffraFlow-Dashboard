import { MetricsType } from './metrics-type.enum';

export type MetricsData = {
    type: MetricsType;
    metrics: any;
    selected: { [key: string]: [number, number][] };
};
