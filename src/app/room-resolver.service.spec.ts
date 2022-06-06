import { TestBed } from '@angular/core/testing';

import { RoomResolverService } from './room-resolver.service';

describe('RoomResolverService', () => {
  let service: RoomResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoomResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
