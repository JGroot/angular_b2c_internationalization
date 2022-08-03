/**
 * Enter here the user flows and custom policies for your B2C application
 * To learn more about user flows, visit: https://docs.microsoft.com/en-us/azure/active-directory-b2c/user-flow-overview
 * To learn more about custom policies, visit: https://docs.microsoft.com/en-us/azure/active-directory-b2c/custom-policy-overview
 */
 export const b2cPolicies = {
    names: {
        signUpSignIn: "b2c_1_susi_reset_v2",
        editProfile: "b2c_1_edit_profile_v2"
    },
    authorities: {
        signUpSignIn: {
            authority: "https://fabrikamb2c.b2clogin.com/fabrikamb2c.onmicrosoft.com/b2c_1_susi_reset_v2",
        },
        editProfile: {
            authority: "https://fabrikamb2c.b2clogin.com/fabrikamb2c.onmicrosoft.com/b2c_1_edit_profile_v2"
        }
    },
    authorityDomain: "fabrikamb2c.b2clogin.com",
    clientid: "d512c189-18e4-45c5-90e6-bf172f7958c7",
    redirectUri: "http://localhost:3000",
    postLogoutRedirectUri: "/"
};