import React, { useState, useRef } from "react";
import { NextPage } from "next";
import { Card, Content, Navigation, Button, TextInput } from "../components";
import { useRouter } from "next/router";
import useForm from "react-hook-form";
import { AccountsService } from "../services/accounts";
import { checkUser } from "../utils";

const btnCancelTap = () => {};
const btnSaveTap = () => {};

type Props = {
  id: any;
  token: any;
};

const AddAccount: NextPage<Props> = (props) => {
  const router = useRouter();
  const { register, handleSubmit, errors, setError, clearError } = useForm();
  const formRef = useRef<HTMLFormElement>(null);
  const accountsService = AccountsService();

  const onSubmit = async (data) => {
    console.log(data)
    if (data) {
      await accountsService
        .createAccount(props.token, data.accountName)
        .then(data => {
          window.location.href = `/overview`;
        })
        .catch(async error => {
          console.log(error);
        });
    }
  };

  return (
    <div className="flex">
      <Content>
        <div className="w-full h-screen max-w-xs mx-auto bg-surface flex items-center flex flex-col">
          <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
            <div className="h-32"></div>
            <div className="p-5 headline-4 text-center">
              Give your new <br></br> account a name.
            </div>

            <div className="self-center w-full ">
              <TextInput
                errorState={errors.name != undefined}
                name="account"
                label="Account Name"
                inputRef={register({ required: true })}
                hint="Required"
              />
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
                  // onClick={() => router.push("/overview")}
                  className="mr-4"
                  bgColour="primary"
                  type="solid"
                  buttonType="submit"
                >
                  SAVE
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Content>
    </div>
  );
};

AddAccount.getInitialProps = async ctx => {
  const user = await checkUser(ctx);

  return user;
};

export default AddAccount;
