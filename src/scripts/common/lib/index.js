require("./zepto-1.2.0.min.js");
require("./namespace.js");
require("./log.js");
require("./cookie.js");
require("./zepto-deferred.js");
require("./zepto-callback.js");
require("./zepto-data.js");
var fastClick = require("./fastclick.js");
$(function() {
    fastClick(document.body);
});