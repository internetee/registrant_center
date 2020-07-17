import { Loading } from './Loading';

describe('components/common/ErrorMessage', () => {
  it('should show content', () => {
    const cmp = shallow(<Loading lang="et" user />);
    expect(cmp.find('.loading')).toHaveLength(1);
  });
});
