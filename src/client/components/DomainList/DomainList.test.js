import Cookies from 'universal-cookie';
import DomainList from './DomainList';
import mockDomains from '../../../../test/mocks/domains';
import mockContacts from '../../../../test/mocks/contacts';

const cookies = new Cookies();

describe('components/DomainList', () => {
  
  it('should render DomainsList', () => {
    const cmp = shallow(<DomainList lang='et' domains={mockDomains.data} contacts={mockContacts.data} cookies={cookies} />);
    expect(cmp).toMatchSnapshot();
  });
  
});