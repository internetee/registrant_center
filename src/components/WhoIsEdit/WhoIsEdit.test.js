/* eslint-disable react/prop-types */
import React from "react"
import { shallow } from "enzyme"
import WhoIsEdit from "./WhoIsEdit"
import mockUser from "../../__mocks__/user"
import mockDomains from "../../__mocks__/domains"
import mockContacts from "../../__mocks__/contacts"
import Helpers from "../../utils/helpers"

describe("components/WhoIsEdit", () => {
    it("should show content", () => {
        const contacts = Helpers.getDomainContacts(mockDomains[0], mockContacts)
        const test = Helpers.getDomains(mockDomains)
        const cmp = shallow(
            <WhoIsEdit contacts={contacts} domain={test[0]} user={mockUser} />
        )
        expect(cmp).toMatchSnapshot()
    })
})
