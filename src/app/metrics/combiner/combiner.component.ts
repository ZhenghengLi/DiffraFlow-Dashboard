import { Component, OnInit, OnDestroy } from '@angular/core';
import { MetricsDataService } from '../metrics-data.service';

@Component({
    selector: 'app-combiner',
    templateUrl: './combiner.component.html',
    styleUrls: ['./combiner.component.scss'],
})
export class CombinerComponent implements OnInit, OnDestroy {
    constructor(private _metricsData: MetricsDataService) {}

    ngOnInit(): void {
        console.log('init combiner');
    }

    ngOnDestroy(): void {
        console.log('destroy combiner');
    }
}
