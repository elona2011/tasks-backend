const xml2js = require("xml2js")
const convert = require('xml-js')

const xmlBuilder = new xml2js.Builder({ headless: true, cdata: true, rootName: "xml" });

function fixXmlObj(obj) {
    let r = {}
    Object.keys(obj.xml).forEach(n => {
        r[n] = obj.xml[n]._cdata || obj.xml[n]._text
    })
    return r
}

module.exports = {
    js2xml(obj) {
        let xml = xmlBuilder.buildObject(obj)
        console.log('xml', xml)
        return xml
    },
    xml2js(xml) {
        return fixXmlObj(convert.xml2js(xml, { compact: true }))
    }
}