import React, { useEffect, useState } from 'react';
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
import { useCookies } from 'react-cookie';
import { Loading, MainLayout, PageMessage } from '../../components';

const perPageOptions = [
    { key: 6, text: '6', value: 6 },
    { key: 12, text: '12', value: 12 },
    { key: 24, text: '24', value: 24 },
];

const CompaniesPage = ({ initialCompanies }) => {
    const [cookies, setCookie] = useCookies(['companies_per_page']);
    const { companies_per_page } = cookies;
    const [perPage, setPerPage] = useState(companies_per_page ? Number(companies_per_page) : 24);
    const [activePage, setActivePage] = useState(1);
    const [companies, setCompanies] = useState(initialCompanies);
    const [isLoading, setIsLoading] = useState(true);
    const [queryKeys, setQueryKeys] = useState('');

    useEffect(() => {
        setCompanies(initialCompanies);
        setIsLoading(false);
    }, [initialCompanies, cookies]);

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
            setCompanies(initialCompanies);
        }
        setQueryKeys(value);
    };

    const handleSearchReset = () => {
        setActivePage(1);
        setQueryKeys('');
        setCompanies(initialCompanies);
    };

    const handleSearch = () => {
        let filteredCompanies = initialCompanies.slice();
        if (queryKeys.length) {
            const query = queryKeys.toLowerCase();
            filteredCompanies = filteredCompanies.filter((company) => {
                return (
                    company.nimi.toLowerCase().includes(query) ||
                    company.ariregistri_kood.toString().toLowerCase().includes(query) ||
                    company.yldandmed.aadressid.some((item) => {
                        return (
                            item.tanav_maja_korter.toLowerCase().includes(query) ||
                            item.ehak_nimetus.toLowerCase().includes(query) ||
                            item.postiindeks.toLowerCase().includes(query)
                        );
                    })
                );
            });
            setCompanies(filteredCompanies);
        } else if (queryKeys.length === 0) {
            setCompanies(initialCompanies);
        }
    };

    if (isLoading && !companies) return <Loading />;
    let companiesList = [];
    const paginatedCompanies = [];
    if (companies.length) {
        const copied = [...companies];
        const numOfChild = Math.ceil(copied.length / perPage);
        for (let i = 0; i < numOfChild; i += 1) {
            paginatedCompanies.push(copied.splice(0, perPage));
        }
        companiesList = paginatedCompanies[activePage - 1].map((company) => (
            <Table.Row key={company.ariregistri_kood}>
                <Table.Cell>{company.nimi}</Table.Cell>
                <Table.Cell>{company.ariregistri_kood}</Table.Cell>
                <Table.Cell>
                    {company.yldandmed.sidevahendid.length > 0 &&
                        company.yldandmed.sidevahendid.map((item) => {
                            return <p key={item.kirje_id}>{item.sisu}</p>;
                        })}
                </Table.Cell>
                <Table.Cell>
                    {company.yldandmed.aadressid.length > 0 &&
                        company.yldandmed.aadressid.map((item) => {
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
        <MainLayout hasBackButton titleKey="companies.title">
            <div className="page page--companies">
                {initialCompanies.length ? (
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
                                                placeholder="Otsi ettevõtet"
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
                        {companies ? (
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

const mapStateToProps = (state) => ({
    initialCompanies: state.user.data.companies,
});

export default connect(mapStateToProps)(CompaniesPage);
