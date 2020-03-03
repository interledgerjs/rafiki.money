import React, { useState } from "react";
import { NextPage } from "next";
import { Card, Content, Navigation, Button } from "../components";

const btnCancelTap = () => {};
const btnSaveTap = () => {};

const Settings: NextPage = () => {
  return (
    <div className="flex">
      <Content>
        <div className="flex flex-col items-center justify-center my-20 h-64">
          <div className="p-5 headline-4">Give your new account a name.</div>
          <input className="p-5" placeholder="Account Name" type="text"></input>
          <div className="flex p-5">
              <div className="pr-3">
            <Button type="text" onTap={btnCancelTap}>
              Go back
            </Button>
              </div>
              <div>

            <Button type="solid" onTap={btnSaveTap}>
              Add account
            </Button>
              </div>
          </div>
        </div>
      </Content>
    </div>
  );
};

export default Settings;
