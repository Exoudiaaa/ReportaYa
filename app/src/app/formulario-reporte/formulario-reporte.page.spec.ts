import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormularioReportePage } from './formulario-reporte.page';

describe('FormularioReportePage', () => {
  let component: FormularioReportePage;
  let fixture: ComponentFixture<FormularioReportePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FormularioReportePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
