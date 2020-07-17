const convert = require('xml-js')

function fixXmlObj(obj) {
    let r = {}
    Object.keys(obj.xml).forEach(n => {
        r[n] = obj.xml[n]._cdata || obj.xml[n]._text
    })
    return r
}

module.exports = {
    js2xml(obj) {
        let xml = convert.js2xml(obj, { compact: true })
        return xml
    },
    xml2js(xml) {
        return fixXmlObj(convert.xml2js(xml, { compact: true }))
    }
}