export default {
    getDomainContacts: (domain = {}, contacts = {}) => {
        return Object.values(contacts).reduce((acc, item) => {
            const roles = new Set();
            if (item.id === domain.registrant.id) {
                roles.add('registrant');
            }
            domain.tech_contacts.forEach(contact => {
                if (contact.id === item.id) {
                    roles.add('tech');
                }
            });
            domain.admin_contacts.forEach(contact => {
                if (contact.id === item.id) {
                    roles.add('admin');
                }
            });
            if (roles.size > 0) {
                acc.push({
                    id: item.id,
                    name: item.name,
                    code: item.code,
                    ident: item.ident,
                    email: item.email,
                    phone: item.phone,
                    roles,
                    disclosed_attributes: new Set(item.disclosed_attributes),
                });
            }
            return acc;
        }, []);
    },
    getUserContacts: (user = {}, domain = {}, contacts = {}) => {
        const userContacts = Object.values(contacts).filter(
            item =>
                item.ident.code === user.ident &&
                item.ident.type !== 'org' &&
                domain.contacts[item.id]
        );
        return userContacts.reduce(
            (acc, contact) => ({
                ...acc,
                [contact.id]: {
                    ...contact,
                    ...domain.contacts[contact.id],
                    initialName: contact.email,
                    initialEmail: contact.email,
                    disclosed_attributes: new Set(contact.disclosed_attributes),
                },
            }),
            {}
        );
    },
    getChangedUserContactsByDomain: (domains = {}, contacts = {}) => {
        return Object.values(domains).reduce((acc, item) => {
            const changedDomain = {
                name: item.name,
                roles: new Set(),
            };
            if (contacts[item.registrant.id]) {
                changedDomain.roles.add('registrant');
            }
            item.tech_contacts.forEach(({ id }) => {
                if (contacts[id]) {
                    changedDomain.roles.add('tech');
                }
            });
            item.admin_contacts.forEach(({ id }) => {
                if (contacts[id]) {
                    changedDomain.roles.add('admin');
                }
            });
            if (changedDomain.roles.size > 0) {
                acc.push(changedDomain);
            }
            return acc;
        }, []);
    },
};
