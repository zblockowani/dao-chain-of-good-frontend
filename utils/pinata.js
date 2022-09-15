import * as pinataSDK from "@pinata/sdk"

const pinata = pinataSDK("9a70facd5b2e2297b53c", "8d99d334e220b8f742c844656015ae9b536f757c6b249227f1be695f8d838d53");

export const saveToIPFS = (data) => {
    return pinata.pinJSONToIPFS(data);
}