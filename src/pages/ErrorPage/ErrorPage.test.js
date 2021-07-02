import "core-js"
import React from "react"
import { shallow } from "enzyme"
import ErrorPage from "./ErrorPage"
import Providers from "../../__mocks__/Providers"

describe("pages/ErrorPage", () => {
    it("should render", () => {
        const component = shallow(
            <Providers>
                <ErrorPage />
            </Providers>
        )
        expect(component).toMatchSnapshot()
    })
})
