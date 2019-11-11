This document sets to outline who the Route mapping occurs for accounts and agreements, it needs to deal with 
two scenarios:
* Incoming ILP Packets from users/services (URL mapping)
* Incoming ILP packets from Uplink (ILP Address Mapping)


### URL Mapping
Access to the system can occur either as a straight account or an agreement
- Account URL mapping -> /accounts/:id/ilp
- Agreement URL mapping -> /agreements/:id/ilp

It could be conceived that access to an account should always be under an agreement? and thus would only require one URL?

Also possible to have the uplink scoped to a specific URL address
- /uplink/ilp ?

### ILP Address Mapping
Incoming Peer is uplink and we are terminating the connection on our side

- account mapping -> test.wallet.connectionHash~accountTagEncoded
- Agreement Mapping -> test.wallet.connectionHash~agreementTagEncoded

Challenge here is getNextHop will be called for outgoing. May need a way to say it is self? Or we actually host this 
downstream of the connector.

Incoming Peer is uplink and we are forwarding the packet downstream.
This is a harder problem and maybe don't need to support right now 
