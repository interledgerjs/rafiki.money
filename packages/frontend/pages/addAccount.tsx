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
        <div className="w-full h-screen max-w-xs mx-auto bg-surface flex items-center flex flex-col">
          <div className="h-32"></div>
          <div className="p-5 headline-4 text-center">
            Give your new <br></br> account a name.
          </div>

          <div className="self-center w-full ">
          <TextInput name="account" label="Account Name" />
          </div>

          <div className="flex p-5">
            <div className="pr-3">
              <Button
                onClick={() => router.push("/overview")}
                className="mr-4"
                bgColour="primary"
                type="text"
              >
                GO BACK
              </Button>
            </div>
            <div>
              <Button
                onClick={() => router.push("/overview")}
                className="mr-4"
                bgColour="primary"
                type="solid"
              >
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
