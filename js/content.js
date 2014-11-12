injectRestylingScript();

chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name === "d3decon");

    port.onMessage.addListener(function(msg) {
        if (msg.type === "update") {
            var evt = document.createEvent("CustomEvent");
            evt.initCustomEvent("updateEvent", true, true, msg);
            document.dispatchEvent(evt);
            console.log("dispatched update event");
            console.log(msg);
        }
    });
});

function injectRestylingScript() {
    var script;
    script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = chrome.extension.getURL('dist/restyling-injected.js');
    return document.body.appendChild(script);
}