import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MetricsDataService } from '../metrics-data.service';

@Component({
    selector: 'app-sender',
    templateUrl: './sender.component.html',
    styleUrls: ['./sender.component.scss'],
})
export class SenderComponent implements OnInit, OnDestroy {
    constructor(private _metricsData: MetricsDataService) {}

    public metricsSubscription: Subscription;
    public currentMetricsStr: string;
    public currentId: number;
    public dataset: [number, number][];
    public updateTime: Date;

    ngOnInit(): void {
        console.log('init sender');
        this.resume();
    }

    ngOnDestroy(): void {
        console.log('destroy sender');
        this.pause();
    }

    resume(): void {
        if (!this.metricsSubscription) {
            this.metricsSubscription = this._metricsData.senderMetrics.subscribe((data) => {
                console.log(data);
                this.currentMetricsStr = JSON.stringify(data);
                this.currentId = data.data;

                this.dataset = [];
                let currentTime = new Date().getTime();
                for (let i = 0; i <= 60; i++) {
                    this.dataset.push([currentTime - i * 1000, 1.5 + Math.sin((i - this.currentId * 0.5) / 5)]);
                }

                this.updateTime = new Date();
            });
        }
    }

    pause(): void {
        if (this.metricsSubscription) {
            this.metricsSubscription.unsubscribe();
            this.metricsSubscription = undefined;
        }
    }
}
