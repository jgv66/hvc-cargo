import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AcopiarPage } from './acopiar.page';

describe('AcopiarPage', () => {
  let component: AcopiarPage;
  let fixture: ComponentFixture<AcopiarPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AcopiarPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AcopiarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
