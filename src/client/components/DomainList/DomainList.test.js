import Cookies from 'universal-cookie';
import DomainList from './DomainList';
import mockDomains from '../../../../test/mocks/domains';
import mockContacts from '../../../../test/mocks/contacts';

const cookies = new Cookies();

describe('components/DomainList', () => {
    it('should render DomainsList', () => {
        const cmp = shallow(
            <DomainList
                contacts={mockContacts.data}
                cookies={cookies}
                domains={mockDomains.data}
                lang="et"
            />
        );
        expect(cmp).toMatchSnapshot();
    });
});
