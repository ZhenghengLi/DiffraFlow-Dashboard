import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
    selector: 'app-time-line-chart',
    templateUrl: './time-line-chart.component.html',
    styleUrls: ['./time-line-chart.component.scss'],
})
export class TimeLineChartComponent implements OnInit {
    constructor() {}

    ngOnInit(): void {}

    private _dataIdVal: number;

    public options: any;

    @Input()
    set dataId(anId: number) {
        console.log('time-line-chart: got value ', anId);
        this._dataIdVal = anId;
        this._updateOptions();
    }

    get dataId(): number {
        return this._dataIdVal;
    }

    private _updateOptions(): void {
        const xAxisData = [];
        const data1 = [];

        for (let i = 0; i < 60; i++) {
            xAxisData.push(i);
            data1.push(
                100 +
                    (Math.sin((i - this._dataIdVal * 0.5) / 5) * ((i - this._dataIdVal * 0.5) / 5 - 10) +
                        (i - this._dataIdVal * 0.5) / 6) *
                        5
            );
        }

        this.options = {
            tooltip: {},
            xAxis: {
                data: xAxisData,
                boundaryGap: false,
            },
            yAxis: {},
            series: [
                {
                    type: 'line',
                    symbol: 'none',
                    lineStyle: {
                        color: 'green',
                    },
                    data: data1,
                    areaStyle: {
                        color: 'green',
                    },
                    animationDelay: (idx) => idx * 10,
                },
            ],
            animationEasing: 'elasticOut',
            animationDelayUpdate: (idx) => idx * 5,
        };
    }
}
