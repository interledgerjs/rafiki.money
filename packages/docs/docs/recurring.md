---
id: recurring
title: Recurring Billing
sidebar_label: Recurring Billing
---

Another common payments flow for digital goods is recurring billing. This can range from subscriptions
,such as Netflix and Spotify, to resource based usage of services, such as pay per view of articles on a news site. Interledger
Merchants can request recurring based billing through specifying an interval on which payments would occur. They would then
be able to PULL these funds to the maximum authorized amount for that interval. This guide is going to walk through 
completing a recurring billing experience using your Payment Pointer from Rafiki Money.

Ensure you have created and setup your account as shown in [Getting Started](intro#get-started).

## Recurring Billing Flow

1. Get your Payment pointer from [Rafiki Money](https://rafiki.money)
2. Visit [ILPFlix](https://rafiki.shop/subscribe)
3. Select the plan you want to subscribe to.
4. Enter your Payment Pointer in *Payment Details* and click **Subscribe** 

You will now be prompted to follow an authorization flow to authorize ILPFlix access to the funds for your order. Its 
important to note you are now told this is a RECURRING payment. Also the frequency with which the Merchant can request 
the funds is specified.

5. Enter your Login details for your Rafiki Money account.
6. Details of the Payment is presented, select which account the funds should come from and click **Authorize**

The merchant, *ILPFlix*, will now be able to PULL the funds from your account according to the authorization.

## Managing Recurring Billing

TODO

