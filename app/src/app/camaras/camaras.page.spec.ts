import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CamarasPage } from './camaras.page';

describe('CamarasPage', () => {
  let component: CamarasPage;
  let fixture: ComponentFixture<CamarasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CamarasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
