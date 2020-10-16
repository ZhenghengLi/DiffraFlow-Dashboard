import { Component, OnInit, OnDestroy } from '@angular/core';
import { MetricsDataService } from '../metrics-data.service';

@Component({
    selector: 'app-combiner',
    templateUrl: './combiner.component.html',
    styleUrls: ['./combiner.component.scss'],
})
export class CombinerComponent implements OnInit, OnDestroy {
    constructor(private metrics_data: MetricsDataService) {}

    ngOnInit(): void {
        console.log('init combiner: metrics_data: ', this.metrics_data.myId);
    }

    ngOnDestroy(): void {
        console.log('destroy combiner');
    }
}
