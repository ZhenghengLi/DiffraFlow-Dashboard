import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MetricsDataService } from '../metrics-data.service';
import { MetricsType } from '../metrics-type.enum';

@Component({
    selector: 'app-sender',
    templateUrl: './sender.component.html',
    styleUrls: ['./sender.component.scss'],
})
export class SenderComponent implements OnInit, OnDestroy {
    constructor(private _metricsService: MetricsDataService) {}

    public metricsSubscription: Subscription;
    public metricsData: any;
    public updateTime: Date;
    public selectedView: string;

    public packetRate = ['Packet1', 'Packet2'];

    ngOnInit(): void {
        console.log('init sender');
        this._metricsService.select(MetricsType.sender);
        this.resume();
    }

    ngOnDestroy(): void {
        console.log('destroy sender');
        this._metricsService.unselect();
    }

    resume(): void {
        if (!this.metricsSubscription) {
            this.metricsSubscription = this._metricsService.metricsNotifier.subscribe((data) => {
                this.metricsData = data;
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

    select(event: any): void {
        this.selectedView = event.target.value;
        console.log(event.target.value);
    }
}
