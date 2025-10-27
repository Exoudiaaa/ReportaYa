import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistorialCamarasPage } from './historial-camaras.page';

describe('HistorialCamarasPage', () => {
  let component: HistorialCamarasPage;
  let fixture: ComponentFixture<HistorialCamarasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HistorialCamarasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
