import { useIntl } from 'react-intl';

const Roles = ({ roles = [] }) => {
    const { formatMessage } = useIntl();
    // Convert Set to Array if needed
    const rolesArray = roles instanceof Set ? Array.from(roles) : roles;
    return rolesArray.map((role, i) => {
        const domainRole = formatMessage({
            id: `domain.role.${role}`,
        });
        if (i === roles.length - 1) {
            return domainRole;
        }
        if (i === roles.length - 2) {
            return `${domainRole} & `;
        }
        return `${domainRole}, `;
    });
};

export default Roles;
