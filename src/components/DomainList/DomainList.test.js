import "core-js"
import React from "react"
import { mount, shallow } from "enzyme"
import DomainList from "./DomainList"
import contacts from "../../__mocks__/contacts"
import domains from "../../__mocks__/domains"
import Providers from "../../__mocks__/Providers"

describe("components/DomainList", () => {
    it("should render DomainsList", () => {
        const cmp = shallow(
            <Providers>
                <DomainList contacts={contacts} domains={domains} />
            </Providers>
        )
        expect(cmp).toMatchSnapshot()
    })

    it("should show domains grid on link click", () => {
        const cmp = mount(
            <Providers>
                <DomainList contacts={contacts} domains={domains} />
            </Providers>
        )
        cmp.find(".action--grid").at(0).simulate("click")
        expect(cmp).toMatchSnapshot()
        cmp.unmount()
    })

    it("should show domains list on link click", () => {
        const cmp = mount(
            <Providers>
                <DomainList contacts={contacts} domains={domains} />
            </Providers>
        )
        cmp.find(".action--list").at(0).simulate("click")
        expect(cmp).toMatchSnapshot()
        cmp.unmount()
    })

    it("should show domains filters on link click", () => {
        const cmp = mount(
            <Providers>
                <DomainList contacts={contacts} domains={domains} />
            </Providers>
        )
        cmp.find(".action--filter").at(0).simulate("click")
        expect(cmp).toMatchSnapshot()
        cmp.unmount()
    })

    it("should show domain extra info on link click", () => {
        const cmp = mount(
            <Providers>
                <DomainList contacts={contacts} domains={domains} />
            </Providers>
        )
        cmp.find(".toggle").at(0).simulate("click")
        expect(cmp).toMatchSnapshot()
        cmp.unmount()
    })
})
