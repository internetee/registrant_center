export default {
    getChangedUserContactsByDomain: (domains = {}, contacts = {}) => {
        return Object.values(domains).reduce((acc, domain) => {
            const changedDomain = {
                id: domain.id,
                name: domain.name,
                roles: new Set(),
            };
            if (contacts[domain.registrant.id]) {
                changedDomain.roles.add('registrant');
            }
            domain.tech_contacts.forEach(({ id }) => {
                if (contacts[id]) {
                    changedDomain.roles.add('tech');
                }
            });
            domain.admin_contacts.forEach(({ id }) => {
                if (contacts[id]) {
                    changedDomain.roles.add('admin');
                }
            });
            if (changedDomain.roles.size > 0) {
                return [
                    ...acc,
                    {
                        ...changedDomain,
                        roles: [...changedDomain.roles],
                    },
                ];
            }
            return acc;
        }, []);
    },
    getDomainContacts: (domain = {}, contacts = {}) => {
        return Object.values(contacts).reduce((acc, item) => {
            const roles = new Set();
            if (item.id === domain.registrant.id) {
                roles.add('registrant');
            }
            domain.tech_contacts.forEach((contact) => {
                if (contact.id === item.id) {
                    roles.add('tech');
                }
            });
            domain.admin_contacts.forEach((contact) => {
                if (contact.id === item.id) {
                    roles.add('admin');
                }
            });
            if (roles.size > 0) {
                acc.push({
                    code: item.code,
                    disclosed_attributes: new Set(item.disclosed_attributes),
                    email: item.email,
                    id: item.id,
                    ident: item.ident,
                    name: item.name,
                    phone: item.phone,
                    roles,
                });
            }
            return acc;
        }, []);
    },
    getUserContacts: (user = {}, domain = {}, contacts = {}) => {
        const userContacts = Object.values(contacts).filter(
            (contact) =>
                contact.ident.code === user.ident &&
                contact.ident.type !== 'org' &&
                domain.contacts[contact.id]
        );
        return userContacts.reduce(
            (acc, contact) => ({
                ...acc,
                [contact.id]: {
                    ...contact,
                    ...domain.contacts[contact.id],
                    disclosed_attributes: new Set(contact.disclosed_attributes),
                    initialEmail: contact.email,
                    initialName: contact.email,
                },
            }),
            {}
        );
    },
};
