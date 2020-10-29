import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
    selector: 'app-time-line-chart',
    templateUrl: './time-line-chart.component.html',
    styleUrls: ['./time-line-chart.component.scss'],
})
export class TimeLineChartComponent implements OnInit {
    constructor() {}

    ngOnInit(): void {}

    private _dataVal: [number, number][];

    public options: any;
    public initOpts: any = {
        renderer: 'svg',
    };

    @Input()
    title: string = '';
    @Input()
    yLabel: string = '';
    @Input()
    set data(dataVal: [number, number][]) {
        this._dataVal = dataVal;
        this._updateOptions();
    }

    private _updateOptions(): void {
        this.options = {
            title: {
                text: this.title,
                left: 'center',
                textStyle: {
                    fontWeight: 'normal',
                    fontSize: 20,
                },
            },
            grid: {
                left: 30,
                bottom: 30,
                right: 70,
                top: 35,
            },
            xAxis: {
                boundaryGap: false,
                type: 'time',
                interval: 10000,
                axisLabel: {
                    formatter: (value) => {
                        return new Date(value).toLocaleTimeString('en-US', { hour12: false });
                    },
                },
            },
            yAxis: {
                position: 'right',
                name: this.yLabel,
                nameTextStyle: {
                    fontSize: 14,
                    padding: 35,
                },
                nameLocation: 'center',
            },
            series: [
                {
                    type: 'line',
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        color: 'green',
                    },
                    data: this._dataVal,
                    areaStyle: {
                        color: 'lightgreen',
                    },
                },
            ],
        };
    }
}
