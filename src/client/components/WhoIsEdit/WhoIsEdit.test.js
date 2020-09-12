import WhoIsEdit from './WhoIsEdit';
import mockUser from '../../../../test/mocks/user';
import mockDomains from '../../../../test/mocks/domains';
import mockContacts from '../../../../test/mocks/contacts';
import Helpers from '../../utils/helpers';

describe('components/WhoIsEdit', () => {
    it('should show content', () => {
        const contacts = Helpers.getDomainContacts(mockDomains.data[0], mockContacts.data);
        const cmp = shallow(<WhoIsEdit contacts={contacts} lang="et" user={mockUser} />);
        expect(cmp).toMatchSnapshot();
    });
});
