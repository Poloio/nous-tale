import { TestBed } from '@angular/core/testing';

import { SessionsResolver } from './sessions.resolver';

describe('SessionsResolver', () => {
  let resolver: SessionsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(SessionsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
