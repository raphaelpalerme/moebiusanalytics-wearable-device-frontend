import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeartRateAverageComponent } from './heart-rate-average.component';

describe('HeartRateAverageComponent', () => {
  let component: HeartRateAverageComponent;
  let fixture: ComponentFixture<HeartRateAverageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HeartRateAverageComponent]
    });
    fixture = TestBed.createComponent(HeartRateAverageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
