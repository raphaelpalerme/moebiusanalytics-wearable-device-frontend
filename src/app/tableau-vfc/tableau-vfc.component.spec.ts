import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableauVfcComponent } from './tableau-vfc.component';

describe('TableauVfcComponent', () => {
  let component: TableauVfcComponent;
  let fixture: ComponentFixture<TableauVfcComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TableauVfcComponent]
    });
    fixture = TestBed.createComponent(TableauVfcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
