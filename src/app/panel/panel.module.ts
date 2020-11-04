import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PanelRoutingModule } from './panel-routing.module';
import { PanelComponent } from './panel.component';

@NgModule({
    declarations: [PanelComponent],
    imports: [CommonModule, FormsModule, PanelRoutingModule],
})
export class PanelModule {}
