import React from "react"
import { shallow } from "enzyme"
import { TransferOwnershipModal } from "../../../modules/transfer";

describe("TransferOwnershipModal", () => {
    const props = <div></div>
    it("should render Transfer ownership text", () => {
        const component = shallow(<TransferOwnershipModal children={props} />)
        const text = component.find("h1").text()
        expect(text).toEqual("Transfer ownership")
    })

    it("next button should disabled first", () => {
        const component = shallow(<TransferOwnershipModal children={props} />)
        const button = component.find("button").prop("disabled")
        expect(button).toBeFalsy()
    })
})