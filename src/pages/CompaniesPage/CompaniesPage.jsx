import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
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
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useCookies } from 'react-cookie';
import { bindActionCreators } from 'redux';
import { Loading, MainLayout, PageMessage } from '../../components';
import { fetchCompanies as fetchCompaniesAction } from '../../redux/reducers/companies';

const perPageOptions = [
    { key: 6, text: '6', value: 6 },
    { key: 12, text: '12', value: 12 },
    { key: 24, text: '24', value: 24 },
];

const CompaniesPage = ({ companies = [], fetchCompanies }) => {
    const { formatMessage } = useIntl();
    const [cookies, setCookie] = useCookies(['companies_per_page']);
    const { companies_per_page } = cookies;
    const [perPage, setPerPage] = useState(companies_per_page ? Number(companies_per_page) : 24);
    const [activePage, setActivePage] = useState(1);
    const [results, setResults] = useState(companies);
    const [isLoading, setIsLoading] = useState(true);
    const [queryKeys, setQueryKeys] = useState('');

    useEffect(() => {
        (async () => {
            await fetchCompanies();
            setIsLoading(false);
        })();
    }, [fetchCompanies]);

    useEffect(() => {
        setResults(companies);
    }, [companies]);

    const handlePageChange = (e, { activePage: page }) => {
        setActivePage(page);
    };

    const handleItemsPerPage = (event, { value }) => {
        setCookie('companies_per_page', value, { path: '/companies' });
        setActivePage(1);
        setPerPage(value);
    };

    const handleSearchChange = (event, { value }) => {
        if (value === '') {
            setResults(companies);
        }
        setQueryKeys(value);
    };

    const handleSearchReset = () => {
        setActivePage(1);
        setQueryKeys('');
        setResults(companies);
    };

    const handleSearch = () => {
        let filteredCompanies = companies.slice();
        if (queryKeys.length) {
            const query = queryKeys.toLowerCase();
            filteredCompanies = filteredCompanies.filter(
                (company) =>
                    company.name.toLowerCase().includes(query) ||
                    company.registry_no.toString().toLowerCase().includes(query)
            );
            setResults(filteredCompanies);
        } else if (queryKeys.length === 0) {
            setResults(companies);
        }
    };

    if (isLoading) return <Loading />;
    let companiesList = [];
    const paginatedCompanies = [];

    if (results && results.length) {
        const copied = [...results];
        const numOfChild = Math.ceil(copied.length / perPage);
        for (let i = 0; i < numOfChild; i += 1) {
            paginatedCompanies.push(copied.splice(0, perPage));
        }
        companiesList = paginatedCompanies[activePage - 1].map((company) => (
            <Table.Row key={company.registry_no}>
                <Table.Cell>{company.name}</Table.Cell>
                <Table.Cell>{company.registry_no}</Table.Cell>
            </Table.Row>
        ));
    }

    return (
        <MainLayout hasBackButton titleKey="companies.title">
            <div className="page page--companies">
                {companies.length ? (
                    <>
                        <div className="page--header">
                            <Container>
                                <Form className="form-filter" onSubmit={handleSearch}>
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
                                                onChange={handleSearchChange}
                                                placeholder={formatMessage({
                                                    id: 'companies.searchForACompany',
                                                })}
                                                size="massive"
                                                type="text"
                                            />
                                            <Button
                                                color="orange"
                                                icon="sync"
                                                onClick={handleSearchReset}
                                                type="reset"
                                            />
                                            <Button icon="arrow right" primary type="submit" />
                                        </div>
                                        <div className="form-filter--actions" />
                                    </div>
                                </Form>
                            </Container>
                        </div>
                        {results ? (
                            <>
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
                                                    <>
                                                        <FormattedMessage
                                                            id="pagination.next"
                                                            tagName="span"
                                                        />
                                                        <Icon name="arrow right" />
                                                    </>
                                                ),
                                                disabled: activePage === paginatedCompanies.length,
                                                icon: true,
                                            }}
                                            onPageChange={handlePageChange}
                                            prevItem={{
                                                content: (
                                                    <>
                                                        <Icon name="arrow left" />
                                                        <FormattedMessage
                                                            id="pagination.previous"
                                                            tagName="span"
                                                        />
                                                    </>
                                                ),
                                                disabled: activePage === 1,
                                                icon: true,
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
                                                    onChange={handleItemsPerPage}
                                                    options={perPageOptions}
                                                    selection
                                                    value={perPage}
                                                />
                                            </Form.Field>
                                        </Form>
                                    </Container>
                                </div>
                            </>
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
                    </>
                ) : (
                    <PageMessage
                        headerContent={
                            <FormattedMessage id="companies.none.message.title" tagName="span" />
                        }
                        icon="frown outline"
                    >
                        <FormattedMessage id="companies.none.message.content" tagName="p" />
                    </PageMessage>
                )}
            </div>
        </MainLayout>
    );
};

const mapStateToProps = ({ companies }) => ({
    companies: companies.ids.map((id) => companies.data[id]),
});

const mapDispatchToProps = (dispatch) =>
    bindActionCreators(
        {
            fetchCompanies: fetchCompaniesAction,
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(CompaniesPage);

CompaniesPage.propTypes = {
    companies: PropTypes.array.isRequired,
    fetchCompanies: PropTypes.func.isRequired,
};
