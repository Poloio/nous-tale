import { TestBed } from '@angular/core/testing';

import { PlayersResolverService } from './players-resolver.service';

describe('PlayersResolverService', () => {
  let service: PlayersResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayersResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
