// markup createParserState(a, b): runs once per parsed message. Clean channel names built in but turned off (common case).
var settings = {cleanChannels: false}, features = {cleanChannels: true};
var featureTable = {};
function enabled(key) { return !!settings[key] && !!features[key]; }
function copyStatics() {}
function replaceValue(o, k, v) { o[k] = v; return o; }
var channelStore = {getChannel: function () { return null; }};
var CLEAN_TYPES = new Set([0, 2]);
function hook(exports, key, operation) {
    var orig = exports[key], call2 = operation.call2;
    var patched = typeof call2 === "function" ?
        function (a, b) { return arguments.length === 2 ? call2(orig, this, a, b) : operation(orig, this, arguments); } :
        function () { return operation(orig, this, arguments); };
    copyStatics(patched, orig);
    return replaceValue(exports, key, patched);
}
function finish(state) {
    var clean = features.cleanChannels && enabled("cleanChannels");
    if (!clean || !state || !Array.isArray(state.channels) || !channelStore || typeof channelStore.getChannel !== "function") return state;
    return state;
}
function oldHook(orig, self, args) { var state = orig.apply(self, args); return finish(state); }
function newHook(orig, self, args) { return finish(orig.apply(self, args)); }
newHook.call2 = function (orig, self, a, b) { return finish(orig.call(self, a, b)); };
var st = {channels: []};
function mk() { return {createParserState: function (a, b) { return st; }}; }
var o = hook(mk(), "createParserState", oldHook), n = hook(mk(), "createParserState", newHook);
var sink = 0;
bench("old createParserState x100", function () { for (var i = 0; i < 100; i++) if (o.createParserState({}, {})) sink++; });
bench("new createParserState x100", function () { for (var i = 0; i < 100; i++) if (n.createParserState({}, {})) sink++; });
