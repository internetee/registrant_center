import React, { useState } from 'react';
import { Button, Grid, Icon, Container } from 'semantic-ui-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { CSVDownload } from 'react-csv';
import PropTypes from 'prop-types';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { connect } from 'react-redux';
import vfs from '../../utils/vfs_fonts';

pdfMake.vfs = vfs;
pdfMake.fonts = {
    Raleway: {
        bold: 'Raleway-v4020-Black.woff',
        bolditalics: 'Raleway-v4020-BlackItalic.woff',
        italics: 'Raleway-v4020-MediumItalic.woff',
        normal: 'Raleway-v4020-Medium.woff',
    },
};

const UserData = ({ domains, isTech }) => {
    const hasDomains = !!Object.keys(domains).length;
    const [isLoadingCSV, setIsLoadingCSV] = useState(false);
    const [isLoadingPDF, setIsLoadingPDF] = useState(false);
    const [userCSV, setUserCSV] = useState(null);
    const { formatMessage } = useIntl();

    const savePDF = () => {
        setIsLoadingPDF(true);
        const paginatedDomains = [];
        const copied = [...domains];
        paginatedDomains.push(copied);
        paginatedDomains.forEach((chunk, index) => {
            const doc = {
                defaultStyle: {
                    font: 'Raleway',
                },
                pageSize: 'A4',
                pageMargins: [40, 90, 40, 40],
                styles: {
                    header: {
                        fontSize: 24,
                        lineHeight: 1,
                        bold: true,
                        margin: [0, 0, 0, 10],
                    },
                    subheader: {
                        fontSize: 18,
                        lineHeight: 1,
                        bold: true,
                        margin: [0, 0, 0, 10],
                    },
                    table: {
                        margin: [0, 0, 0, 20],
                        fontSize: 12,
                        lineHeight: 0.9,
                        color: '#212224',
                    },
                },
                header: () => ({
                    columns: [
                        {
                            image:
                                'data:image/png;base64,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',
                            width: 120,
                            alignment: 'left',
                        },
                        { text: moment(Date.now()).format('DD.MM.Y HH:mm'), alignment: 'right' },
                    ],
                    margin: [40, 30, 40, 0],
                }),
                footer: (currentPage, pageCount) => ({
                    stack: [
                        {
                            text: `${currentPage.toString()}/${pageCount}`,
                        },
                    ],
                    margin: [40, 0],
                }),
                content: [
                    ...chunk.map((item, i) => {
                        let domainData = [
                            item.transfer_code
                                ? [
                                      {
                                          text: formatMessage({ id: 'domain.transfer_code' }),
                                          bold: true,
                                      },
                                      item.transfer_code,
                                  ]
                                : [],
                            item.registrar.name
                                ? [
                                      {
                                          text: formatMessage({ id: 'domain.registrar' }),
                                          bold: true,
                                      },
                                      `${item.registrar.name} (${item.registrar.website})`,
                                  ]
                                : [],
                            item.registered_at
                                ? [
                                      {
                                          text: formatMessage({ id: 'domain.registered_at' }),
                                          bold: true,
                                      },
                                      moment(item.registered_at).format('DD.MM.Y HH:mm'),
                                  ]
                                : [],
                            item.valid_to
                                ? [
                                      {
                                          text: formatMessage({ id: 'domain.valid_to' }),
                                          bold: true,
                                      },
                                      moment(item.valid_to).format('DD.MM.Y HH:mm'),
                                  ]
                                : [],
                            item.created_at
                                ? [
                                      {
                                          text: formatMessage({ id: 'domain.created_at' }),
                                          bold: true,
                                      },
                                      moment(item.created_at).format('DD.MM.Y HH:mm'),
                                  ]
                                : [],
                            item.updated_at
                                ? [
                                      {
                                          text: formatMessage({ id: 'domain.updated_at' }),
                                          bold: true,
                                      },
                                      moment(item.updated_at).format('DD.MM.Y HH:mm'),
                                  ]
                                : [],
                            item.period
                                ? [
                                      { text: formatMessage({ id: 'domain.period' }), bold: true },
                                      `${item.period} (${item.period_unit})`,
                                  ]
                                : [],
                            item.outzone_at
                                ? [
                                      {
                                          text: formatMessage({ id: 'domain.outzone_at' }),
                                          bold: true,
                                      },
                                      moment(item.outzone_at).format('DD.MM.Y HH:mm'),
                                  ]
                                : [],
                            item.delete_at
                                ? [
                                      {
                                          text: formatMessage({ id: 'domain.delete_at' }),
                                          bold: true,
                                      },
                                      moment(item.delete_at).format('DD.MM.Y HH:mm'),
                                  ]
                                : [],
                            item.registrant_verification_asked_at
                                ? [
                                      {
                                          text: formatMessage({
                                              id: 'domain.registrant_verification_asked_at',
                                          }),
                                          bold: true,
                                      },
                                      moment(item.registrant_verification_asked_at).format(
                                          'DD.MM.Y HH:mm'
                                      ),
                                  ]
                                : [],
                            item.registrant_verification_token
                                ? [
                                      {
                                          text: formatMessage({
                                              id: 'domain.registrant_verification_token',
                                          }),
                                          bold: true,
                                      },
                                      item.registrant_verification_token,
                                  ]
                                : [],
                            item.force_delete_at
                                ? [
                                      {
                                          text: formatMessage({ id: 'domain.force_delete_at' }),
                                          bold: true,
                                      },
                                      moment(item.force_delete_at).format('DD.MM.Y HH:mm'),
                                  ]
                                : [],
                            item.locked_by_registrant_at
                                ? [
                                      {
                                          text: formatMessage({
                                              id: 'domain.locked_by_registrant_at',
                                          }),
                                          bold: true,
                                      },
                                      moment(item.locked_by_registrant_at).format('DD.MM.Y HH:mm'),
                                  ]
                                : [],
                            item.reserved
                                ? [
                                      {
                                          text: formatMessage({ id: 'domain.reserved' }),
                                          bold: true,
                                      },
                                      item.reserved,
                                  ]
                                : [],
                        ];
                        const domainNameservers = item.nameservers
                            ? item.nameservers.map((server) => [
                                  server.hostname,
                                  server.ipv4.toString(),
                                  server.ipv6.toString(),
                              ])
                            : [];
                        const registrantContacts = item.registrant && [
                            { text: formatMessage({ id: 'domain.role.registrant' }), bold: true },
                            item.registrant.name,
                            '-',
                        ];
                        const techContacts = item.tech_contacts
                            ? item.tech_contacts.map(({ email, name }) => {
                                  return [
                                      {
                                          text: formatMessage({ id: 'domain.role.tech' }),
                                          bold: true,
                                      },
                                      name,
                                      email,
                                  ];
                              })
                            : ['', '', ''];
                        const adminContacts = item.admin_contacts
                            ? item.admin_contacts.map(({ email, name }) => {
                                  return [
                                      {
                                          text: formatMessage({ id: 'domain.role.admin' }),
                                          bold: true,
                                      },
                                      name,
                                      email,
                                  ];
                              })
                            : ['', '', ''];
                        const domainStatus = item.statuses
                            ? item.statuses.map((status) => [
                                  {
                                      text: formatMessage({ id: `domain.status.${status}` }),
                                      bold: true,
                                  },
                                  formatMessage({ id: `domain.status.${status}.description` }),
                              ])
                            : [];
                        domainData = domainData.filter((e) => e.length > 0);
                        return [
                            { text: item.name, style: 'header', pageBreak: i > 0 && 'before' },
                            {
                                style: 'table',
                                table: {
                                    widths: ['30%', '70%'],
                                    body: domainData,
                                },
                                layout: {
                                    hLineWidth: (lineIndex, node) =>
                                        lineIndex === 0 || lineIndex === node.table.body.length
                                            ? 1
                                            : 1,
                                    vLineWidth: () => 0,
                                    hLineColor: () => '#eaebed',
                                    vLineColor: () => '#eaebed',
                                    paddingLeft: () => 10,
                                    paddingRight: () => 10,
                                    paddingTop: () => 4,
                                    paddingBottom: () => 4,
                                },
                            },
                            { text: 'Kontaktid', style: 'subheader' },
                            {
                                style: 'table',
                                table: {
                                    headerRow: 1,
                                    widths: ['30%', '35%', '35%'],
                                    body: [
                                        [
                                            { text: 'Tüüp', bold: true },
                                            { text: 'Nimi', bold: true },
                                            { text: 'E-post', bold: true },
                                        ],
                                        registrantContacts,
                                        ...techContacts,
                                        ...adminContacts,
                                    ],
                                },
                                layout: {
                                    hLineWidth: (lineIndex, node) =>
                                        lineIndex === 0 || lineIndex === node.table.body.length
                                            ? 1
                                            : 1,
                                    vLineWidth: () => 0,
                                    hLineColor: () => '#eaebed',
                                    vLineColor: () => '#eaebed',
                                    paddingLeft: () => 10,
                                    paddingRight: () => 10,
                                    paddingTop: () => 4,
                                    paddingBottom: () => 4,
                                },
                            },
                            {
                                text: formatMessage({ id: 'domain.nameservers' }),
                                style: 'subheader',
                            },
                            {
                                style: 'table',
                                table: {
                                    headerRow: 1,
                                    widths: ['30%', '35%', '35%'],
                                    body: [
                                        [
                                            { text: 'Hostinimi', bold: true },
                                            { text: 'ipv4', bold: true },
                                            { text: 'ipv6', bold: true },
                                        ],
                                        ...domainNameservers,
                                    ],
                                },
                                layout: {
                                    hLineWidth: (lineIndex, node) =>
                                        lineIndex === 0 || lineIndex === node.table.body.length
                                            ? 1
                                            : 1,
                                    vLineWidth: () => 0,
                                    hLineColor: () => '#eaebed',
                                    vLineColor: () => '#eaebed',
                                    paddingLeft: () => 10,
                                    paddingRight: () => 10,
                                    paddingTop: () => 4,
                                    paddingBottom: () => 4,
                                },
                            },
                            { text: formatMessage({ id: 'domain.statuses' }), style: 'subheader' },
                            {
                                style: 'table',
                                table: {
                                    headerRow: 1,
                                    widths: ['30%', '70%'],
                                    body: [...domainStatus],
                                },
                                layout: {
                                    hLineWidth: (lineIndex, node) =>
                                        lineIndex === 0 || lineIndex === node.table.body.length
                                            ? 1
                                            : 1,
                                    vLineWidth: () => 0,
                                    hLineColor: () => '#eaebed',
                                    vLineColor: () => '#eaebed',
                                    paddingLeft: () => 10,
                                    paddingRight: () => 10,
                                    paddingTop: () => 4,
                                    paddingBottom: () => 4,
                                },
                            },
                        ];
                    }),
                ],
            };

            pdfMake.createPdf(doc).download(`domeenid_chunk_${index}.pdf`);
        });
        setIsLoadingPDF(false);
    };

    const handleCsvData = async () => {
        setIsLoadingCSV(true);
        const csv = domains.map((item) => {
            return {
                [formatMessage({ id: 'domain.name' })]: item.name ? item.name : '',
                [formatMessage({ id: 'domain.transfer_code' })]: item.transfer_code
                    ? item.transfer_code
                    : '',
                [formatMessage({ id: 'domain.registrar' })]: item.registrar.name
                    ? `${item.registrar.name} (${item.registrar.website})`
                    : '',
                [formatMessage({ id: 'domain.registered_at' })]: item.registered_at
                    ? moment(item.registered_at).format('DD.MM.Y HH:mm')
                    : '',
                [formatMessage({ id: 'domain.valid_to' })]: item.valid_to
                    ? moment(item.valid_to).format('DD.MM.Y HH:mm')
                    : '',
                [formatMessage({ id: 'domain.created_at' })]: item.created_at
                    ? moment(item.created_at).format('DD.MM.Y HH:mm')
                    : '',
                [formatMessage({ id: 'domain.updated_at' })]: item.updated_at
                    ? moment(item.updated_at).format('DD.MM.Y HH:mm')
                    : '',
                [formatMessage({ id: 'domain.period' })]: item.period
                    ? `${item.period} (${item.period_unit})`
                    : '',
                [formatMessage({ id: 'domain.outzone_at' })]: item.outzone_at
                    ? moment(item.outzone_at).format('DD.MM.Y HH:mm')
                    : '',
                [formatMessage({ id: 'domain.delete_at' })]: item.delete_at
                    ? moment(item.delete_at).format('DD.MM.Y HH:mm')
                    : '',
                [formatMessage({ id: 'domain.force_delete_at' })]: item.force_delete_at
                    ? moment(item.force_delete_at).format('DD.MM.Y HH:mm')
                    : '',
                [formatMessage({
                    id: 'domain.registrant_verification_token',
                })]: item.registrant_verification_token ? item.registrant_verification_token : '',
                [formatMessage({
                    id: 'domain.registrant_verification_asked_at',
                })]: item.registrant_verification_asked_at
                    ? moment(item.registrant_verification_asked_at).format('DD.MM.Y HH:mm')
                    : '',
                [formatMessage({
                    id: 'domain.locked_by_registrant_at',
                })]: item.locked_by_registrant_at
                    ? moment(item.locked_by_registrant_at).format('DD.MM.Y HH:mm')
                    : '',
                [formatMessage({ id: 'domain.registrant' })]: item.registrant
                    ? item.registrant.name
                    : '',
                [formatMessage({ id: 'domain.tech_contacts' })]: item.tech_contacts
                    ? item.tech_contacts
                          .map((contact) => `${contact.name} ( ${contact.email} )`)
                          .join('\n')
                    : '',
                [formatMessage({ id: 'domain.admin_contacts' })]: item.admin_contacts
                    ? item.admin_contacts
                          .map((contact) => `${contact.name} ( ${contact.email} )`)
                          .join('\n')
                    : '',
                [formatMessage({ id: 'domain.nameservers' })]: item.nameservers
                    ? item.nameservers
                          .map((server) => [
                              server.hostname,
                              server.ipv4.join(', '),
                              server.ipv6.join(', '),
                          ])
                          .join('\n')
                    : '',
                [formatMessage({ id: 'domain.statuses' })]: item.statuses
                    ? item.statuses
                          .map((status) => formatMessage({ id: `domain.status.${status}` }))
                          .join('\n')
                    : '',
                [formatMessage({ id: 'domain.reserved' })]: item.reserved ? item.reserved : '',
            };
        });

        setIsLoadingCSV(false);
        setUserCSV(csv);
    };

    return (
        <div className="user-data">
            <Container>
                <Grid textAlign="center">
                    <Grid.Row centered columns="1">
                        <Grid.Column textAlign="center">
                            <FormattedMessage id="userData.title" tagName="h3" />
                            <Button.Group>
                                <Button
                                    animated="fade"
                                    disabled={!hasDomains}
                                    loading={isLoadingCSV}
                                    onClick={handleCsvData}
                                    secondary
                                    size="large"
                                >
                                    <Button.Content visible>
                                        <Icon name="table" />
                                        CSV
                                    </Button.Content>
                                    <Button.Content hidden>
                                        <Icon name="download" />
                                    </Button.Content>
                                </Button>
                                <Button.Or text="või" />
                                <Button
                                    animated="fade"
                                    disabled={!hasDomains}
                                    loading={isLoadingPDF}
                                    onClick={savePDF}
                                    primary
                                    size="large"
                                >
                                    <Button.Content visible>
                                        <Icon name="file pdf" />
                                        PDF
                                    </Button.Content>
                                    <Button.Content hidden>
                                        <Icon name="download" />
                                    </Button.Content>
                                </Button>
                            </Button.Group>
                            {userCSV && <CSVDownload data={userCSV} filename="eis_andmed.csv" />}
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Container>
        </div>
    );
};

const mapStateToProps = ({ domains }) => {
    return {
        domains: Object.values(domains.data.domains),
    };
};

export default connect(mapStateToProps)(UserData);

UserData.propTypes = {
    domains: PropTypes.array,
    isTech: PropTypes.string,
};

UserData.defaultProps = {
    domains: [],
    isTech: '',
};
