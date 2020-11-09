import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

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
import { MetricsCardComponent } from './common/metrics-card/metrics-card.component';

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
        MetricsCardComponent,
    ],
    imports: [SharedModule, MetricsRoutingModule],
    providers: [MetricsDataService],
})
export class MetricsModule {}
