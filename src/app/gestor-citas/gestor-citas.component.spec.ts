import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestorCitasComponent } from './gestor-citas.component';

describe('GestorCitasComponent', () => {
  let component: GestorCitasComponent;
  let fixture: ComponentFixture<GestorCitasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestorCitasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestorCitasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
