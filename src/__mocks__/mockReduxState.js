import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import user from './user';
import domains from './domains';
import contacts from './contacts';
import footer from './menuFooter';
import main from './menuMain';
import { parseDomain } from '../redux/reducers/domains';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

export default mockStore({
	contacts: {
		data: contacts.reduce(
			(acc, item) => ({
				...acc,
				[item.id]: item,
			}),
			{}
		),
		ids: contacts.map((item) => item.id),
		isLoading: false,
		message: null,
	},
	domains: {
		data: domains.reduce(
			(acc, item) => ({
				...acc,
				[item.id]: parseDomain(item),
			}),
			{}
		),
		ids: domains.map((item) => item.id),
		isLoading: false,
	},
	ui: {
		lang: 'et',
		mainMenu: {
			isOpen: false,
		},
		menus: {
			footer,
			main,
		},
		uiElemSize: 'big',
	},
	user: {
		data: {
			...user,
			name: `${user.first_name} ${user.last_name}`,
		},
		status: 200,
	},
});
