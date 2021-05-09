import { TimeAgoPipe } from './time-ago.pipe';

describe('TimeAgoPipe', () => {

  let pipe:TimeAgoPipe;

  beforeEach(() => {

    pipe = new TimeAgoPipe();

  });

  it('create an instance', () => {

    expect(pipe).toBeTruthy();
  });
});
