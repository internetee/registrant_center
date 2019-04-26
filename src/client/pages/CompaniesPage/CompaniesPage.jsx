import React, {Component} from 'react';
import { FormattedMessage } from 'react-intl';
import { Pagination, Button, Form, Dropdown, Icon, Container, Table, Input } from 'semantic-ui-react';
import { connect } from 'react-redux';
import {withCookies} from 'react-cookie';
import {Helmet, Loading, MainLayout, PageMessage} from '../../components';

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
    companies: null
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
      activePage
    }));
  };
  
  handleItemsPerPage = (event, { value }) => {
    const { cookies } = this.props;
    cookies.set('companies_per_page', value, { path: '/companies' });
    this.setState(prevState => ({
      ...prevState,
      activePage: 1,
      perPage: value
    }));
  };
  
  handleSearchChange = (event, {name, value}) => {
    const { initialCompanies } = this.props;
    if (name in this.state) {
      if (value === '') {
        this.setState(prevState => ({
          ...prevState,
          [name]: value,
          companies: initialCompanies
        }));
      } else {
        this.setState(prevState => ({
          ...prevState,
          [name]: value
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
      companies: initialCompanies
    }));
  };
  
  handleSearch = () => {
    const { queryKeys } = this.state;
    const { initialCompanies } = this.props;
    let filteredCompanies = initialCompanies.slice();
    if (queryKeys.length) {
      const query = queryKeys.toLowerCase();
      filteredCompanies = filteredCompanies.filter(company => {
        return company.nimi.toLowerCase().includes(query) ||
          company.ariregistri_kood.toString().toLowerCase().includes(query) ||
          company.yldandmed.aadressid.some(item => {
            return item.tanav_maja_korter.toLowerCase().includes(query) ||
              item.ehak_nimetus.toLowerCase().includes(query) ||
              item.postiindeks.toLowerCase().includes(query);
          });
      });
      this.setState(prevState => ({
        ...prevState,
        companies: filteredCompanies
      }));
    } else if (queryKeys.length === 0) {
      this.setState(prevState => ({
        ...prevState,
        companies: initialCompanies
      }));
    }
  };
  
  render() {
    const { ui, user, history, initialCompanies } = this.props;
    const { perPage, activePage, queryKeys, isLoading, companies } = this.state;
    
    if (isLoading && !companies) return <Loading/>;
    
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
          <Table.Cell>
            {company.nimi}
          </Table.Cell>
          <Table.Cell>
            {company.ariregistri_kood}
          </Table.Cell>
          <Table.Cell>
            {company.yldandmed.sidevahendid.length > 0 && company.yldandmed.sidevahendid.map(item => {
              return (<p key={item.kirje_id}>{item.sisu}</p>);
            })}
          </Table.Cell>
          <Table.Cell>
            {company.yldandmed.aadressid.length > 0 && company.yldandmed.aadressid.map(item => {
              return (<p key={item.tanav_maja_korter}>{`${item.tanav_maja_korter}, ${item.ehak_nimetus}, ${item.postiindeks}`}</p>);
            })}
          </Table.Cell>
        </Table.Row>
      ));
    }
    return (
      <MainLayout ui={ui} user={user}>
        <FormattedMessage
          id="companies.page_title"
          defaultMessage='Ettevõtted | EIS Registreerijaportaal'
        >
          {title => (
            <Helmet>
              <title>{title}</title>
            </Helmet>
          )}
        </FormattedMessage>
        <div className='main-hero'>
          <FormattedMessage
            id='companies.title'
            defaultMessage='Minu ettevõtted'
            tagName='h1'
          />
          <button type='button' className='back-link' onClick={history.goBack}><Icon name='arrow left' />
            <FormattedMessage
              id='hero.link.back'
              defaultMessage='Tagasi'
              tagName='span'
            />
          </button>
        </div>
        <div className='page page--companies'>
          { initialCompanies.length ? (
            <React.Fragment>
              <div className='page--header'>
                <Container>
                  <Form className='form-filter' onSubmit={this.handleSearch}>
                    <div className='form-filter--search'>
                      <div className='form-filter--actions'>
                        {/* <Button as={Link} to={'/'} color='green'>Lisa uus</Button> */}
                      </div>
                      <div className='search-field'>
                        <Input className='icon' placeholder='Otsi ettevõtet' type='text' name='queryKeys' size='massive' defaultValue={queryKeys} disabled={isLoading} onChange={this.handleSearchChange} />
                        <Button type='reset' color='orange' icon='sync' onClick={this.handleSearchReset} />
                        <Button type='submit' primary icon='arrow right'/>
                      </div>
                      <div className='form-filter--actions' />
                    </div>
                  </Form>
                </Container>
              </div>
              { companies ? (
                <React.Fragment>
                  <Container>
                    <Table>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell>
                            <FormattedMessage
                              id='companies.name'
                              defaultMessage='Nimi'
                              tagName='span'
                            />
                          </Table.HeaderCell>
                          <Table.HeaderCell>
                            <FormattedMessage
                              id='companies.register_code'
                              defaultMessage='Registrikood'
                              tagName='span'
                            />
                          </Table.HeaderCell>
                          <Table.HeaderCell>
                            <FormattedMessage
                              id='companies.contacts'
                              defaultMessage='Kontaktid'
                              tagName='span'
                            />
                          </Table.HeaderCell>
                          <Table.HeaderCell>
                            <FormattedMessage
                              id='companies.addresses'
                              defaultMessage='Aadressid'
                              tagName='span'
                            />
                          </Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        { companiesList }
                      </Table.Body>
                    </Table>
                  </Container>
                  <div className='paginator'>
                    <Container>
                      <Pagination
                        activePage={ activePage }
                        onPageChange={ this.handlePageChange }
                        totalPages={ paginatedCompanies.length }
                        firstItem={ null }
                        lastItem={ null }
                        prevItem={{
                          content: (
                            <React.Fragment>
                              <Icon name='arrow left' />
                              <FormattedMessage
                                id='pagination.previous'
                                defaultMessage='Eelmised'
                                tagName='span'
                              />
                            </React.Fragment>),
                          icon: true,
                          disabled: activePage === 1,
                        }}
                        nextItem={{
                          content: (
                            <React.Fragment>
                              <FormattedMessage
                                id='pagination.next'
                                defaultMessage='Järgmised'
                                tagName='span'
                              />
                              <Icon name='arrow right' />
                            </React.Fragment>),
                          icon: true,
                          disabled: activePage === paginatedCompanies.length
                        }}
                      />
                      <Form>
                        <Form.Field inline>
                          <FormattedMessage
                            id='pagination.per_page'
                            defaultMessage='Tulemusi lehel'
                            tagName='label'
                          />
                          <Dropdown selection options={perPageOptions} value={perPage} onChange={this.handleItemsPerPage} />
                        </Form.Field>
                      </Form>
                    </Container>
                  </div>
                </React.Fragment>
              ) : (
                <PageMessage
                  headerContent={(
                    <FormattedMessage
                      id="companies.search.message.title"
                      defaultMessage="Otsingule vastavaid ettevõtteid ei leitud"
                      tagName="span"
                    />
                  )}
                >
                  <FormattedMessage
                    id="companies.search.message.text"
                    defaultMessage="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet assumenda blanditiis delectus dicta molestias, mollitia officia pariatur porro quis, repellat repudiandae sapiente sequi, voluptatem? Adipisci eveniet explicabo quibusdam tempora ut!"
                    tagName="p"
                  />
                </PageMessage>
              )}
            </React.Fragment>
          ) : (
            <PageMessage
              headerContent={(
                <FormattedMessage
                  id="companies.none.message.title"
                  defaultMessage="Äriregistri andmetel Teile ühtegi ettevõtet ei kuulu"
                  tagName="span"
                />
              )}
              icon="frown outline"
            >
              <FormattedMessage
                id="companies.none.message.text"
                defaultMessage="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet assumenda blanditiis delectus dicta molestias, mollitia officia pariatur porro quis, repellat repudiandae sapiente sequi, voluptatem? Adipisci eveniet explicabo quibusdam tempora ut!"
                tagName="p"
              />
            </PageMessage>
          )}
        </div>
      </MainLayout>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    initialCompanies: state.user.data.companies,
  };
};

export default withCookies(connect(mapStateToProps)(CompaniesPage));