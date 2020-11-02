import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PanelRoutingModule } from './panel-routing.module';
import { PanelComponent } from './panel.component';
import { ControllerService } from './controller.service';

@NgModule({
    declarations: [PanelComponent],
    imports: [CommonModule, PanelRoutingModule],
    providers: [ControllerService],
})
export class PanelModule {}
