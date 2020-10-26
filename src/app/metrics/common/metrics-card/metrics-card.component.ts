import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-metrics-card',
    templateUrl: './metrics-card.component.html',
    styleUrls: ['./metrics-card.component.scss'],
})
export class MetricsCardComponent implements OnInit {
    constructor() {}

    ngOnInit(): void {}

    @Input()
    public title: string = '';

    @Input()
    public data: any;

    public showContent: boolean = true;
}
