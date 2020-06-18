const xml2js = require("xml2js")

const xmlBuilder = new xml2js.Builder({ headless: true, cdata: true, rootName: "xml" });

module.exports = {
    js2xml(obj) {
        let xml = xmlBuilder.buildObject(obj)
        return xml
    }
}