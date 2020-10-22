import { MetricsType } from './metrics-type.enum';

export type MetricsData = {
    type: MetricsType;
    metrics: any;
    selected: { [parameter: string]: { [instance: string]: [number, number][] } };
};
