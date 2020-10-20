import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxEchartsModule } from 'ngx-echarts';

import { MetricsRoutingModule } from './metrics-routing.module';
import { MetricsComponent } from './metrics.component';
import { DispatcherComponent } from './dispatcher/dispatcher.component';
import { CombinerComponent } from './combiner/combiner.component';
import { IngesterComponent } from './ingester/ingester.component';
import { SenderComponent } from './sender/sender.component';
import { MonitorComponent } from './monitor/monitor.component';
import { ControllerComponent } from './controller/controller.component';
import { OverviewComponent } from './overview/overview.component';
import { MetricsDataService } from './metrics-data.service';
import { TimeLineChartComponent } from './common/time-line-chart/time-line-chart.component';

@NgModule({
    declarations: [
        MetricsComponent,
        DispatcherComponent,
        CombinerComponent,
        IngesterComponent,
        SenderComponent,
        MonitorComponent,
        ControllerComponent,
        OverviewComponent,
        TimeLineChartComponent,
    ],
    imports: [
        CommonModule,
        MetricsRoutingModule,
        NgxEchartsModule.forRoot({
            echarts: () => import('echarts'),
        }),
    ],
    providers: [MetricsDataService],
})
export class MetricsModule {}
