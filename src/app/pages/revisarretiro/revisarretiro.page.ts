import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-revisarretiro',
  templateUrl: './revisarretiro.page.html',
  styleUrls: ['./revisarretiro.page.scss'],
})
export class RevisarretiroPage implements OnInit {

  @Input() item;

  constructor( private modalCtrl: ModalController ) { }

  ngOnInit() {}

  salir() {
    this.modalCtrl.dismiss();
  }



}
