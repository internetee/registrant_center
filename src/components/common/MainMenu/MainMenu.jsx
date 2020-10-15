import React, { useEffect, useState } from 'react';
import { Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

const MainMenu = ({ items, lang, user, closeMainMenu }) => {
    const [menu, setMenu] = useState([]);

    useEffect(() => {
        if (items) {
            const menuItems = items
                .reduce((acc, item) => {
                    // Exclude portals menu items
                    const exludedItems = [2133844, 2223713, 2142515];
                    // Find current language first level menu items
                    if (
                        item.language.code === lang &&
                        item.node.parent_id === 2089596 &&
                        !exludedItems.includes(item.node.id)
                    ) {
                        // Find current menu items children
                        const children = items.filter(
                            (child) =>
                                child.node.parent_id === item.node.id &&
                                child.language.code === lang &&
                                !exludedItems.includes(child.node.id)
                        );
                        return [
                            ...acc,
                            {
                                ...item,
                                children,
                                isOpen: false,
                            },
                        ];
                    }
                    return acc;
                }, [])
                .sort((a, b) => a.node.position - b.node.position);
            setMenu(menuItems);
        }
    }, [items, lang]);

    const handleSubmenu = (cur) => {
        setMenu((prevState) =>
            prevState.map((item, i) => {
                if (cur === i) {
                    return {
                        ...item,
                        isOpen: !item.isOpen,
                    };
                }
                return item;
            })
        );
    };

    return (
        <nav className="menu-main">
            <ul>
                {user && user.ident && (
                    <li>
                        <Link onClick={() => closeMainMenu()} to="/">
                            <FormattedMessage id="menu.main.dashboard" />
                        </Link>
                    </li>
                )}
                {menu.map((item, i) => (
                    <li key={item.id} className={item.isOpen ? 'u-submenu-open' : ''}>
                        <a href={item.public_url}>{item.title}</a>
                        {item.children && item.children.length > 0 && (
                            <>
                                <button
                                    className="btn btn--submenu-toggle"
                                    onClick={() => handleSubmenu(i)}
                                    type="button"
                                >
                                    <Icon name="angle down" />
                                </button>
                                <ul>
                                    {item.children.map((subitem) => (
                                        <li key={subitem.id}>
                                            <a href={subitem.public_url}>{subitem.title}</a>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default MainMenu;
