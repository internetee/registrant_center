import React from "react"
import { shallow } from "enzyme"
import Loading from "./Loading"

describe("components/common/ErrorMessage", () => {
    it("should show content", () => {
        const cmp = shallow(<Loading />)
        expect(cmp.find(".loading")).toHaveLength(1)
    })
})
