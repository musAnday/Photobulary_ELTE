import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { DisplayResultsPage } from './display-results';

@NgModule({
  declarations: [
    DisplayResultsPage,
  ],
  imports: [
    IonicPageModule.forChild(DisplayResultsPage),
    TranslateModule.forChild()
  ],
  exports: [
    DisplayResultsPage
  ]
})
export class DisplayResultsPageModule { }
