import MessageModule from './MessageModule';

describe('components/modules/MessageModule', () => {
  
  const mockErrorMessage = {
    type: 'test',
    code: 404
  };
  
  const mockSuccessMessage = {
    type: 'test',
    code: 200
  };
  
  it('should render', () => {
    const cmp = mount(<MessageModule message={mockErrorMessage} lang='et' />);
    expect(cmp).toMatchSnapshot();
  });
  
  it('should render error message', () => {
    const cmp = mount(<MessageModule message={mockErrorMessage} lang='et' />);
    expect(cmp.find('.message').hasClass('negative')).toBeTruthy();
  });
  
  it('should render success message', () => {
    const cmp = mount(<MessageModule message={mockSuccessMessage} lang='et' />);
    expect(cmp.find('.message').hasClass('positive')).toBeTruthy();
  });
  
});