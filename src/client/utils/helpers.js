export default {
  getDomainContacts: (domain, contacts) => {
    console.log(domain, contacts);
    return contacts.reduce((acc, item) => {
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
          disclosed_attributes: new Set(item.disclosed_attributes)
        });
      }
      return acc;
    }, []);
  },
  getUserContacts: (user, domain, contacts) => {
    return contacts.reduce((acc, item) => {
      if (item.ident.code === user.ident && item.ident.type !== 'org') {
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
            disclosed_attributes: new Set(item.disclosed_attributes)
          });
        }
      }
      return acc;
    }, []);
  },
  getChangedUserContactsByDomain: (domains, contacts, changedContacts) => {
    return domains.reduce((acc, item) => {
      const changedDomain = {
        name: item.name,
        roles: new Set()
      };
      if (changedContacts.find(changedContact => changedContact.id === item.registrant.id)) {
        changedDomain.roles.add('registrant');
      }
      item.tech_contacts.forEach(contact => {
        if (changedContacts.find(changedContact => changedContact.id === contact.id)) {
          changedDomain.roles.add('tech');
        }
      });
      item.admin_contacts.forEach(contact => {
        if (changedContacts.find(changedContact => changedContact.id === contact.id)) {
          changedDomain.roles.add('admin');
        }
      });
      if (changedDomain.roles.size > 0) {
        acc.push(changedDomain);
      }
      return acc;
    }, []);
  }
};
