import { ChangeDetectorRef } from '@angular/core';
import { TimeAgoPipe } from './time-ago.pipe';

describe('TimeAgoPipe', () => {
  let ref!:ChangeDetectorRef;
  it('create an instance', () => {
    const pipe = new TimeAgoPipe(ref);
    expect(pipe).toBeTruthy();
  });
});
