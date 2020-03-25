import React, { useState } from "react"
import { NextPage } from "next"
import { Card, Content, Navigation, Button, TextInput, Selector, ToggleSwitch } from "../components"

const Transact: NextPage = () => {
  const [count, setCount] = useState(0)
  const [toggle, setToggle] = useState("SEND")
  if (toggle == "RECEIVE") {
    if (count == 1) setCount(0)
    return (
      <div className="flex">
        <Navigation active="transact"></Navigation>
        <Content navigation>
          <div className="flex justify-center">
            <ToggleSwitch
              active={toggle}
              text={["SEND", "RECEIVE"]}
              onClick={() => setToggle(document.activeElement.textContent)}
            ></ToggleSwitch>
          </div>
          <div className="pb-10"></div>
          <div className="flex justify-center">
            <Card>
              <span className="flex text-center m-8 text-headline-4">
                Receive a payment from
              </span>
              <TextInput
                inputType="text"
                name=""
                label="Payment pointer"
              ></TextInput>
              <div className="flex justify-center pt-4 pb-6">
                <Button
                  type="solid"
                  buttonType="submit"
                  onClick={() => setCount(count + 1)}
                >
                  NEXT
                </Button>
              </div>
            </Card>
          </div>
        </Content>
      </div>
    )
  }
  if (count == 1) {
    return (
      <div className="flex">
        <Navigation active="transact"></Navigation>
        <Content navigation>
          <div className="flex justify-center">
            <ToggleSwitch
              active={toggle}
              text={["SEND", "RECEIVE"]}
              onClick={() => setToggle(document.activeElement.textContent)}
            ></ToggleSwitch>
          </div>
          <div className="pb-10"></div>
          <div className="flex justify-center">
            <Card>
              <div className="flex justify-center pt-10 pb-8">
                <img
                  className="listline-img"
                  src="http://placecorgi.com/200"
                ></img>
                <span className="flex content-center flex-wrap text-headline-5">
                  Bob's Burgers
                </span>
              </div>
              <TextInput inputType="text" name="" label="Amount"></TextInput>
              <div className="pb-10">
                {/*<Selector></Selector>*/}
              </div>
              <div className="flex justify-center pt-4 pb-6">
                <Button type="solid" buttonType="submit">
                  SEND
                </Button>
              </div>
            </Card>
          </div>
        </Content>
      </div>
    )
  }
  return (
    <div className="flex">
      <Navigation active="transact"></Navigation>
      <Content navigation>
        <div className="flex justify-center">
          <ToggleSwitch
            active={toggle}
            text={["SEND", "RECEIVE"]}
            onClick={() => setToggle(document.activeElement.textContent)}
          ></ToggleSwitch>
        </div>
        <div className="pb-10"></div>
        <div className="flex justify-center">
          <Card>
            <span className="flex text-center m-8 text-headline-4">
              Send a payment to
            </span>
            <TextInput
              inputType="text"
              name=""
              label="Payment pointer"
            ></TextInput>
            <div className="flex justify-center pt-4 pb-6">
              <Button
                type="solid"
                buttonType="submit"
                onClick={() => setCount(count + 1)}
              >
                NEXT
              </Button>
            </div>
          </Card>
        </div>
      </Content>
    </div>
  )
}

export default Transact
