import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';
import { DisplayResultsPage } from '../display-results/display-results';

import { DisplayWordsPage } from './display-words';

@NgModule({
  declarations: [
    DisplayWordsPage,
  ],
  imports: [
    IonicPageModule.forChild(DisplayWordsPage),
    TranslateModule.forChild()
  ],
  exports: [
    DisplayWordsPage
  ]
})
export class DisplayWordsPageModule { }
