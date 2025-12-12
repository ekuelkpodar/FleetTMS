import { ensureStopsValid } from './load.controller';
import { StopType } from '@prisma/client';

describe('ensureStopsValid', () => {
  it('throws when missing pickup', () => {
    expect(() =>
      ensureStopsValid([
        { locationId: '1', sequenceNumber: 1, stopType: StopType.DELIVERY },
      ] as any),
    ).toThrow('Load requires at least one pickup and one delivery');
  });

  it('throws when sequence not contiguous', () => {
    expect(() =>
      ensureStopsValid([
        { locationId: '1', sequenceNumber: 1, stopType: StopType.PICKUP },
        { locationId: '2', sequenceNumber: 3, stopType: StopType.DELIVERY },
      ] as any),
    ).toThrow('Stop sequence must be contiguous starting at 1');
  });

  it('passes for valid sequences', () => {
    expect(() =>
      ensureStopsValid([
        { locationId: '1', sequenceNumber: 1, stopType: StopType.PICKUP },
        { locationId: '2', sequenceNumber: 2, stopType: StopType.DELIVERY },
      ] as any),
    ).not.toThrow();
  });
});
