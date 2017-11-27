import { Component, ViewChild, NgModule } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera } from '@ionic-native/camera';
import { IonicPage, NavController, ViewController, App } from 'ionic-angular';
import { DisplayResultsPage } from '../display-results/display-results';


@IonicPage()
@Component({
  selector: 'page-display-words',
  templateUrl: 'display-words.html'//,
  //entryComponents:[ DisplayResultsPage ]
})
/*
@NgModule({
  declarations: [
    DisplayResultsPage,
]})
*/

export class DisplayWordsPage {

  word = ["smile","face","blond"]; //sofia: this is the words array we receive from backend
  @ViewChild('fileInput') fileInput;

  isReadyToSave: boolean;

  item: any;

  form: FormGroup;

  constructor(
      public navCtrl: NavController,
       public viewCtrl: ViewController, 
       formBuilder: FormBuilder, 
       public camera: Camera,     
      public appCtrl: App) {
    this.form = formBuilder.group({
      profilePic: ['']/*,
      name: ['', Validators.required],
      about: ['']*/
    });

    // Watch the form for changes, and
    this.form.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.form.valid;
    });
  }

  ionViewDidLoad() {

  }

  getPicture() {
    if (Camera['installed']()) {
      this.camera.getPicture({
        destinationType: this.camera.DestinationType.DATA_URL,
        targetWidth: 96,
        targetHeight: 96
      }).then((data) => {
        this.form.patchValue({ 'profilePic': 'data:image/jpg;base64,' + data });
      }, (err) => {
        alert('Unable to take photo');
      })
    } else {
      this.fileInput.nativeElement.click();
    }
  }

  processWebImage(event) {
    let reader = new FileReader();
    reader.onload = (readerEvent) => {

      let imageData = (readerEvent.target as any).result;
      this.form.patchValue({ 'profilePic': imageData });
    };

    reader.readAsDataURL(event.target.files[0]);
  }

  getProfileImageStyle() {
    return 'url(' + this.form.controls['profilePic'].value + ')'
  }

  /**
   * The user cancelled, so we dismiss without sending data back.
   */
  cancel() {
    //this.viewCtrl.dismiss();
    this.gotootherpage();
  }

  /**
   * The user is done and wants to create the item, so return it
   * back to the presenter.
   */
  done() {
    if (!this.form.valid) { return; }
    this.gotootherpage();
  }

  gotootherpage(){
    //this.viewCtrl.dismiss(this.form.value);
    this.navCtrl.push(DisplayResultsPage);
    //this.appCtrl.getRootNav().setRoot(DisplayResultsPage);
  }



  startApp() {
    this.navCtrl.setRoot('FirstRunPage', {}, {
      animate: true,
      direction: 'forward'
    });
  }
}
