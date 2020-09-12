import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    Pagination,
    Button,
    Form,
    Dropdown,
    Icon,
    Container,
    Table,
    Input,
} from 'semantic-ui-react';
import { connect } from 'react-redux';
import { withCookies } from 'react-cookie';
import { Helmet, Loading, MainLayout, PageMessage } from '../../components';

const perPageOptions = [
    { key: 6, text: '6', value: 6 },
    { key: 12, text: '12', value: 12 },
    { key: 24, text: '24', value: 24 },
];

class CompaniesPage extends Component {
    state = {
        isLoading: true,
        perPage: 24,
        activePage: 1,
        queryKeys: '',
        companies: null,
    };

    componentDidMount() {
        const { initialCompanies, cookies } = this.props;

        this.setState(prevState => ({
            ...prevState,
            companies: initialCompanies,
            isLoading: false,
            perPage: Number(cookies.get('companies_per_page')) || 24,
        }));
    }

    handlePageChange = (e, { activePage }) => {
        this.setState(prevState => ({
            ...prevState,
            activePage,
        }));
    };

    handleItemsPerPage = (event, { value }) => {
        const { cookies } = this.props;
        cookies.set('companies_per_page', value, { path: '/companies' });
        this.setState(prevState => ({
            ...prevState,
            activePage: 1,
            perPage: value,
        }));
    };

    handleSearchChange = (event, { name, value }) => {
        const { initialCompanies } = this.props;
        if (name in this.state) {
            if (value === '') {
                this.setState(prevState => ({
                    ...prevState,
                    [name]: value,
                    companies: initialCompanies,
                }));
            } else {
                this.setState(prevState => ({
                    ...prevState,
                    [name]: value,
                }));
            }
        }
    };

    handleSearchReset = () => {
        const { initialCompanies } = this.props;
        this.setState(prevState => ({
            ...prevState,
            queryKeys: '',
            activePage: 1,
            companies: initialCompanies,
        }));
    };

    handleSearch = () => {
        const { queryKeys } = this.state;
        const { initialCompanies } = this.props;
        let filteredCompanies = initialCompanies.slice();
        if (queryKeys.length) {
            const query = queryKeys.toLowerCase();
            filteredCompanies = filteredCompanies.filter(company => {
                return (
                    company.nimi.toLowerCase().includes(query) ||
                    company.ariregistri_kood
                        .toString()
                        .toLowerCase()
                        .includes(query) ||
                    company.yldandmed.aadressid.some(item => {
                        return (
                            item.tanav_maja_korter.toLowerCase().includes(query) ||
                            item.ehak_nimetus.toLowerCase().includes(query) ||
                            item.postiindeks.toLowerCase().includes(query)
                        );
                    })
                );
            });
            this.setState(prevState => ({
                ...prevState,
                companies: filteredCompanies,
            }));
        } else if (queryKeys.length === 0) {
            this.setState(prevState => ({
                ...prevState,
                companies: initialCompanies,
            }));
        }
    };

    render() {
        const { ui, user, history, initialCompanies } = this.props;
        const { perPage, activePage, queryKeys, isLoading, companies } = this.state;

        if (isLoading && !companies) return <Loading />;

        let companiesList = [];
        const paginatedCompanies = [];
        if (companies.length) {
            const copied = [...companies];
            const numOfChild = Math.ceil(copied.length / perPage);
            for (let i = 0; i < numOfChild; i += 1) {
                paginatedCompanies.push(copied.splice(0, perPage));
            }
            companiesList = paginatedCompanies[activePage - 1].map(company => (
                <Table.Row key={company.ariregistri_kood}>
                    <Table.Cell>{company.nimi}</Table.Cell>
                    <Table.Cell>{company.ariregistri_kood}</Table.Cell>
                    <Table.Cell>
                        {company.yldandmed.sidevahendid.length > 0 &&
                            company.yldandmed.sidevahendid.map(item => {
                                return <p key={item.kirje_id}>{item.sisu}</p>;
                            })}
                    </Table.Cell>
                    <Table.Cell>
                        {company.yldandmed.aadressid.length > 0 &&
                            company.yldandmed.aadressid.map(item => {
                                return (
                                    <p
                                        key={item.tanav_maja_korter}
                                    >{`${item.tanav_maja_korter}, ${item.ehak_nimetus}, ${item.postiindeks}`}</p>
                                );
                            })}
                    </Table.Cell>
                </Table.Row>
            ));
        }
        return (
            <MainLayout hasBackButton titleKey="companies.title" ui={ui} user={user}>
                <div className="page page--companies">
                    {initialCompanies.length ? (
                        <React.Fragment>
                            <div className="page--header">
                                <Container>
                                    <Form className="form-filter" onSubmit={this.handleSearch}>
                                        <div className="form-filter--search">
                                            <div className="form-filter--actions">
                                                {/* <Button as={Link} to={'/'} color='green'>Lisa uus</Button> */}
                                            </div>
                                            <div className="search-field">
                                                <Input
                                                    className="icon"
                                                    defaultValue={queryKeys}
                                                    disabled={isLoading}
                                                    name="queryKeys"
                                                    onChange={this.handleSearchChange}
                                                    placeholder="Otsi ettevõtet"
                                                    size="massive"
                                                    type="text"
                                                />
                                                <Button
                                                    color="orange"
                                                    icon="sync"
                                                    onClick={this.handleSearchReset}
                                                    type="reset"
                                                />
                                                <Button icon="arrow right" primary type="submit" />
                                            </div>
                                            <div className="form-filter--actions" />
                                        </div>
                                    </Form>
                                </Container>
                            </div>
                            {companies ? (
                                <React.Fragment>
                                    <Container>
                                        <Table>
                                            <Table.Header>
                                                <Table.Row>
                                                    <Table.HeaderCell>
                                                        <FormattedMessage id="companies.name" />
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell>
                                                        <FormattedMessage id="companies.registerCode" />
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell>
                                                        <FormattedMessage id="companies.contacts" />
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell>
                                                        <FormattedMessage id="companies.addresses" />
                                                    </Table.HeaderCell>
                                                </Table.Row>
                                            </Table.Header>
                                            <Table.Body>{companiesList}</Table.Body>
                                        </Table>
                                    </Container>
                                    <div className="paginator">
                                        <Container>
                                            <Pagination
                                                activePage={activePage}
                                                firstItem={null}
                                                lastItem={null}
                                                nextItem={{
                                                    content: (
                                                        <React.Fragment>
                                                            <FormattedMessage
                                                                id="pagination.next"
                                                                tagName="span"
                                                            />
                                                            <Icon name="arrow right" />
                                                        </React.Fragment>
                                                    ),
                                                    icon: true,
                                                    disabled:
                                                        activePage === paginatedCompanies.length,
                                                }}
                                                onPageChange={this.handlePageChange}
                                                prevItem={{
                                                    content: (
                                                        <React.Fragment>
                                                            <Icon name="arrow left" />
                                                            <FormattedMessage
                                                                id="pagination.previous"
                                                                tagName="span"
                                                            />
                                                        </React.Fragment>
                                                    ),
                                                    icon: true,
                                                    disabled: activePage === 1,
                                                }}
                                                totalPages={paginatedCompanies.length}
                                            />
                                            <Form>
                                                <Form.Field inline>
                                                    <FormattedMessage
                                                        id="pagination.perPage"
                                                        tagName="label"
                                                    />
                                                    <Dropdown
                                                        onChange={this.handleItemsPerPage}
                                                        options={perPageOptions}
                                                        selection
                                                        value={perPage}
                                                    />
                                                </Form.Field>
                                            </Form>
                                        </Container>
                                    </div>
                                </React.Fragment>
                            ) : (
                                <PageMessage
                                    headerContent={
                                        <FormattedMessage
                                            id="companies.search.message.title"
                                            tagName="span"
                                        />
                                    }
                                >
                                    <FormattedMessage
                                        id="companies.search.message.content"
                                        tagName="p"
                                    />
                                </PageMessage>
                            )}
                        </React.Fragment>
                    ) : (
                        <PageMessage
                            headerContent={
                                <FormattedMessage
                                    id="companies.none.message.title"
                                    tagName="span"
                                />
                            }
                            icon="frown outline"
                        >
                            <FormattedMessage id="companies.none.message.content" tagName="p" />
                        </PageMessage>
                    )}
                </div>
            </MainLayout>
        );
    }
}

const mapStateToProps = state => {
    return {
        initialCompanies: state.user.data.companies,
    };
};

export default withCookies(connect(mapStateToProps)(CompaniesPage));
