import UserData from './UserData';
import mockDomains from '../../../../test/mocks/domains';
import mockContacts from '../../../../test/mocks/contacts';

describe('components/UserData', () => {
    it('should show content', () => {
        const cmp = shallow(
            <UserData contacts={mockContacts.data} domains={mockDomains.data} lang="et" />
        );
        expect(cmp).toMatchSnapshot();
    });
});
