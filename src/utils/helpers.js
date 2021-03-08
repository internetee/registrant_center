export default {
    getChangedUserContactsByDomain: (domains = {}, contacts = {}) => {
        try {
            const contactsObj = Object.values(contacts);
            if (contactsObj.length && contactsObj[0].links.length) {
                const arr = [];
                contactsObj.forEach((c) => {
                    c.links.forEach((d) => {
                        arr.push({
                            id: d.id,
                            name: d.name,
                            roles: [],
                        });
                    });
                });

                return arr;
            }
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
        } catch (e) {
            return [];
        }
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
    getDomains: (domains = {}) => {
        return Object.values(domains).map((item) => {
            return item;
        });
    },
    getUserContacts: (user = {}, domain = {}, contacts = {}, companies = {}) => {
        console.log(contacts);
        const company_list = companies.data ? companies.data : companies;
        const userContacts = Object.values(contacts).filter(
            (contact) =>
                (contact.ident.code === user.ident && domain.contacts[contact.id]) ||
                (contact.ident.type === 'org' && company_list[contact.ident.code])
        );
        return userContacts.reduce(
            (acc, contact) => ({
                ...acc,
                [contact.id]: {
                    ...contact,
                    ...domain.contacts[contact.id],
                    disclosed_attributes: new Set(contact.disclosed_attributes),
                    initialEmail: contact.email,
                    initialName: contact.name,
                },
            }),
            {}
        );
    },
    parseDomainContacts: (user = {}, domain = {}, contacts = {}, companies = {}) => {
        const company_list = companies.data ? companies.data : companies;

        return Object.keys(domain.contacts).reduce((acc, key) => {
            const contact = contacts[key];
            if (
                (contact && contact.ident.code === user.ident && domain.contacts[key]) ||
                (contact && contact.ident.type === 'org' && company_list[contact.ident.code])
            ) {
                return {
                    ...acc,
                    [contact.id]: {
                        ...contact,
                        ...domain.contacts[key],
                        disclosed_attributes: new Set(contact.disclosed_attributes),
                        initialEmail: contact.email,
                        initialName: contact.name,
                    },
                };
            }
            return acc;
        }, {});
    },
};
