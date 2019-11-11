

Concerns:
- IndieAuth/Dynamic Auth
    - Currently there isn't a mechanism for clients to specify there 
    - Google Pay requires you to signup as a merchant explicitly
        - https://developers.google.com/pay/api/web/guides/paymentrequest/tutorial
        - https://developers.google.com/pay/api/web/reference/object#PayPalParameters
        - https://github.com/rsolomakhin/rsolomakhin.github.io/blob/master/pr/gp/pr.js
    - Maybe just worth while using dynamic client registration spec
    - https://www.ory.sh/oauth2-for-mobile-app-spa-browser
- Better way to see difference between payment handler call and oauth flow
- Read google OAuth Spec (https://developers.google.com/identity/protocols/OAuth2InstalledApp)


TODOs:
* [ ] Resolve Payment Handler Interface (probably use PKCE OAuth)
* [ ] Resolve Client Identity/Dynamic Registration
* [ ] Map out flow
    * Generate Mandate/Agreement
    * Request auth with scope of mandate (url vs mandate.{mandate.id))
    * Get token
    * Pay the monies
* [ ] Resolve mandate interface/properties
* [ ] Cleanup wallet gui
    * [ ] Convert to next?
    * [ ] Fix login remember stuff
* [ ] Currency Conversion
