const domains = {
  isLoading: false,
  isInvalidated: false,
  data: {
    'bd695cc9-1da8-4c39-b7ac-9a2055e0a93e': {
      id: 'bd695cc9-1da8-4c39-b7ac-9a2055e0a93e',
      name: 'domain.ee',
      registrar: {
        name: 'Test Registrar',
        website: 'https://www.example.com/'
      },
      registered_at: '2018-09-06T13:11:26.333+03:00',
      valid_to: '2019-09-07T00:00:00.000+03:00',
      created_at: '2018-09-06T13:11:26.481+03:00',
      updated_at: '2018-11-01T16:06:44.545+02:00',
      registrant: {
        name: 'Test Registrant',
        id: 'cfbfbb76-aed8-497a-91c1-48d82cbc4588'
      },
      tech_contacts: [
        {
          name: 'Test Tech',
          id: '700829af-4bdd-4c5f-8389-f6568e2ba4ad'
        }
      ],
      admin_contacts: [
        {
          name: 'Test Admin',
          id: '528240a3-3f9e-4d9a-83a2-3b3a43cf0dc7'
        }
      ],
      transfer_code: '1a055bd6b339b94b5ca2205f86dc325d',
      name_dirty: 'domain.ee',
      name_puny: 'domain.ee',
      period: 1,
      period_unit: 'y',
      creator_str: '132',
      updator_str: '133-RegistrantUser: TEST REGISTRANT',
      legacy_id: null,
      legacy_registrar_id: null,
      legacy_registrant_id: null,
      outzone_at: null,
      delete_at: null,
      registrant_verification_asked_at: null,
      registrant_verification_token: null,
      pending_json: {},
      force_delete_at: null,
      statuses: ['ok'],
      locked_by_registrant_at: null,
      reserved: false,
      status_notes: {},
      nameservers: [
        {
          hostname: 'ns2.test.ee',
          ipv4: ['127.0.0.2'],
          ipv6: ['0:0:0:0:0:0:0:2']
        },
        {
          hostname: 'ns1.test.ee',
          ipv4: ['127.0.0.1'],
          ipv6: ['0:0:0:0:0:0:0:1']
        }
      ]
    },
    '2198affc-7479-499d-9eae-b0611ec2fb49': {
      id: '2198affc-7479-499d-9eae-b0611ec2fb49',
      name: 'lockeddomain.ee',
      registrar: {
        name: 'Test Registrar',
        website: 'https://www.example.com/'
      },
      registered_at: '2018-11-02T09:41:23.159+02:00',
      valid_to: '2019-11-03T00:00:00.000+02:00',
      created_at: '2018-11-02T09:41:23.574+02:00',
      updated_at: '2018-11-02T16:33:18.913+02:00',
      registrant: {
        name: 'Test Registrant',
        id: 'cfbfbb76-aed8-497a-91c1-48d82cbc4588'
      },
      tech_contacts: [
        {
          name: 'Test Tech',
          id: '700829af-4bdd-4c5f-8389-f6568e2ba4ad'
        }
      ],
      admin_contacts: [
        {
          name: 'Test Registrant As Admin',
          id: 'cfbfbb76-aed8-497a-91c1-48d82cbc4588'
        }
      ],
      transfer_code: '0245c8bc6281e5383986ff97636ead6d',
      name_dirty: 'lockeddomain.ee',
      name_puny: 'lockeddomain.ee',
      period: 1,
      period_unit: 'y',
      creator_str: '129',
      updator_str: '133-RegistrantUser: TEST REGISTRANT',
      legacy_id: null,
      legacy_registrar_id: null,
      legacy_registrant_id: null,
      outzone_at: null,
      delete_at: null,
      registrant_verification_asked_at: null,
      registrant_verification_token: null,
      pending_json: {},
      force_delete_at: null,
      statuses: [
        'serverUpdateProhibited',
        'serverDeleteProhibited',
        'serverTransferProhibited'
      ],
      locked_by_registrant_at: '2018-11-02T16:33:18.752+02:00',
      reserved: false,
      status_notes: {},
      nameservers: [
        {
          hostname: 'ns2.we.ee',
          ipv4: ['127.0.0.2'],
          ipv6: ['0:0:0:0:0:0:0:2']
        },
        {
          hostname: 'ns1.we.ee',
          ipv4: ['127.0.0.1'],
          ipv6: ['0:0:0:0:0:0:0:1']
        }
      ]
    }
  },
  ids: [
    'bd695cc9-1da8-4c39-b7ac-9a2055e0a93e',
    '2198affc-7479-499d-9eae-b0611ec2fb49'
  ],
  status: null,
  fetchedAt: 1542179235644
};

export default domains;
