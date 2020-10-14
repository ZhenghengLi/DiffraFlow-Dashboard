import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PanelRoutingModule } from './panel-routing.module';
import { PanelComponent } from './panel.component';

@NgModule({
    declarations: [PanelComponent],
    imports: [CommonModule, PanelRoutingModule],
})
export class PanelModule {}
