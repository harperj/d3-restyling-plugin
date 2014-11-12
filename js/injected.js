/**
 * Created by harper on 11/11/14.
 */

var $ = require('jQuery');
var VisUpdater = require('./VisUpdater');

var visData = [];

document.addEventListener("updateEvent", function(evt) {
    var updateMessage = evt.detail;

    if (!window.deconstruction) {
        console.error("Failed to find deconstruction data for update event.");
    }
    else {
        processDeconData();
    }

    visData[updateMessage.vis].updateNodes(updateMessage.ids, updateMessage.attr, updateMessage.val);
});

function processDeconData() {
    if (!window.deconstruction.updaterRecovered) {
        visData = [];

        $.each(window.deconstruction.deconstruction, function(i, decon) {
            visData.push(new VisUpdater(decon.svgNode, decon.dataNodes.nodes, decon.dataNodes.ids, decon.schematizedData));
        });

        window.deconstruction.updaterRecovered = true;
    }
}