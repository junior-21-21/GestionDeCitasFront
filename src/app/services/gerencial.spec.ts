import { TestBed } from '@angular/core/testing';

import { Gerencial } from './gerencial';

describe('Gerencial', () => {
  let service: Gerencial;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Gerencial);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
