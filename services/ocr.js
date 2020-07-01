const tencentcloud = require("tencentcloud-sdk-nodejs");


const OcrClient = tencentcloud.ocr.v20181119.Client;
const models = tencentcloud.ocr.v20181119.Models;

const Credential = tencentcloud.common.Credential;
const ClientProfile = tencentcloud.common.ClientProfile;
const HttpProfile = tencentcloud.common.HttpProfile;

let cred = new Credential("", "");
let httpProfile = new HttpProfile();
httpProfile.endpoint = "ocr.tencentcloudapi.com";
let clientProfile = new ClientProfile();
// clientProfile.signMethod = "TC3-HMAC-SHA256"
clientProfile.httpProfile = httpProfile;
let client = new OcrClient(cred, "ap-guangzhou", clientProfile);


module.exports = {
    ocrTest(ImageBase64) {
        let req = new models.GeneralBasicOCRRequest();

        let params = {
            ImageBase64
        }
        req.from_json_string(JSON.stringify(params));
        client.GeneralBasicOCR(req, function (errMsg, response) {

            if (errMsg) {
                console.log(errMsg);
                return;
            }

            console.log(response.to_json_string());
        });
    }
}