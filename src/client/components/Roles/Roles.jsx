import staticMessages from '../../utils/staticMessages.json';

const Roles = ({ lang, roles }) => {
  return roles.map((role, i) => {
    const { domain } = staticMessages[lang];
    if (i === roles.length - 1) {
      return domain[role];
    }
    if (i === roles.length - 2) {
      return `${domain[role]} & `;
    }
    return `${domain[role]}, `;
  });
};

export default Roles;
