import { useIntl } from 'react-intl';

const Roles = ({ roles = [] }) => {
    const { formatMessage } = useIntl();
    return roles.map((role, i) => {
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
