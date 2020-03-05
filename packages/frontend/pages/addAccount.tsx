import React, { useState } from "react";
import { NextPage } from "next";
import { Card, Content, Navigation, Button, TextInput } from "../components";
import { useRouter } from "next/router";

const btnCancelTap = () => {};
const btnSaveTap = () => {};

const Settings: NextPage = () => {
  const router = useRouter();
  return (
    <div className="flex">
      <Content>
        <div className="flex flex-col items-center justify-center my-20 h-64">
          <div className="p-5 headline-4 text-center">
            Give your new <br></br> account a name.
          </div>
          <input className="p-5" placeholder="Account Name" type="text"></input>
          <div>
            <TextInput name="account" label="Account Name" />
          </div>
          <div className="flex p-5">
            <div className="pr-3">
              <Button
                onTap={() => router.push("/overview")}
                className="mr-4"
                bgColour="primary"
                type="text"
              >
                GO BACK
              </Button>
            </div>
            <div>
              <Button type="solid" onTap={btnSaveTap}>
                SAVE
              </Button>
            </div>
          </div>
        </div>
      </Content>
    </div>
  );
};

export default Settings;
