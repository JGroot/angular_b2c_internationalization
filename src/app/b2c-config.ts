/**
 * Enter here the user flows and custom policies for your B2C application
 * To learn more about user flows, visit: https://docs.microsoft.com/en-us/azure/active-directory-b2c/user-flow-overview
 * To learn more about custom policies, visit: https://docs.microsoft.com/en-us/azure/active-directory-b2c/custom-policy-overview
 */
 export const b2cPolicies = {
    names: {
        signUpSignIn: "b2c_1a_custom_idp4",
        editProfile: "B2C_1_pe"
    },
    authorities: {
        signUpSignIn: {
            authority: "https://reliastaplayground.b2clogin.com/reliastaplayground.onmicrosoft.com/b2c_1a_custom_idp4",
        },
        editProfile: {
            authority: "https://reliastaplayground.b2clogin.com/reliastaplayground.onmicrosoft.com/B2C_1_pe"
        }
    },
    authorityDomain: "https://reliastaplayground.b2clogin.com"
}

/**
 * Enter here the coordinates of your web API and scopes for access token request
 * The current application coordinates were pre-registered in a B2C tenant.
 */
export const apiConfig: { scopes: string[]; uri: string } = {
    scopes: ['https://ReliasTAPlayground.onmicrosoft.com/RLMS/access_as_user'],
    uri: 'https://ReliasTAPlayground.onmicrosoft.com/RLMS'
};
