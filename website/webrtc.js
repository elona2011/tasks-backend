//get the IP addresses associated with an account
function getIPs(callback) {
    var ip_dups = {};

    //compatibility for firefox and chrome
    var RTCPeerConnection = window['RTCPeerConnection']
        || window['mozRTCPeerConnection']
        || window['webkitRTCPeerConnection'];
    var useWebKit = !!window['webkitRTCPeerConnection'];

    //bypass naive webrtc blocking using an iframe
    if (!RTCPeerConnection) {
        //NOTE: you need to have an iframe in the page right above the script tag
        //
        //<iframe id="iframe" sandbox="allow-same-origin" style="display: none"></iframe>
        //<script>...getIPs called in here...
        //
        // var win = iframe.contentWindow;
        // RTCPeerConnection = win.RTCPeerConnection
        //     || win.mozRTCPeerConnection
        //     || win.webkitRTCPeerConnection;
        // useWebKit = !!win.webkitRTCPeerConnection;
        return callback('');
    }

    //minimal requirements for data connection
    var mediaConstraints = {
        optional: [{ RtpDataChannels: true }]
    };

    var servers = { iceServers: [{ urls: "stun:stun.services.mozilla.com" }] };

    var pc;
    try {
        // 这句可能会报错，提示 Failed to construct 'RTCPeerConnection': No PeerConnection handler can be created, perhaps WebRTC is disabled?

        //construct a new RTCPeerConnection
        pc = new RTCPeerConnection(servers, mediaConstraints);
    } catch (e) {
        return callback('');
    }


    function handleCandidate(candidate) {
        //match just the IP address
        var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|([a-f0-9]{1,4})?:?(:[a-f0-9]{1,4}){3}(:[a-f0-9]{0,4}){1,4})/i;
        var ipGroup = ip_regex.exec(candidate);
        if (!ipGroup) {
            return;
        }
        var ip_addr = ip_regex.exec(candidate)[1];

        //remove duplicates
        if (ip_dups[ip_addr] === undefined)
            callback(ip_addr);

        ip_dups[ip_addr] = true;
    }

    //listen for candidate events
    pc.onicecandidate = function (ice) {

        //skip non-candidate events
        if (ice.candidate)
            handleCandidate(ice.candidate.candidate);
    };

    //create a bogus data channel
    pc.createDataChannel("");

    //create an offer sdp
    pc.createOffer(function (result) {

        //trigger the stun server request
        pc.setLocalDescription(result, function () { }, function () { });

    }, function () { });

    //wait for a while to let everything done
    setTimeout(function () {
        try {
            //read candidate info from local description
            var lines = pc.localDescription.sdp.split('\n');

            lines.forEach(function (line) {
                if (line.indexOf('a=candidate:') === 0)
                    handleCandidate(line);
            });
        } catch (e) { }
    }, 1000);
}

//Test: Print the IP addresses into the console
// module.exports = getIPs;
getIPs()