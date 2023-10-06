import { TestBed } from '@angular/core/testing';

import { CarePathwayService } from './care-pathway.service';

describe('CarePathwayService', () => {
  let service: CarePathwayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarePathwayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
