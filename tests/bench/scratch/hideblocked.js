// hideBlockedChannelStream: runs for every chat list build. Feature off (common case): straight through.
var settings = {hideBlocked: false, hideBlockedBlocked: true, hideBlockedIgnored: true, hideBlockedReplies: true};
var features = {hideBlocked: true};
function enabled(key) { return !!settings[key] && !!features[key]; }
var hideBlocked = {version: 0};
function copyStatics() {}
function replaceValue(o, k, v) { o[k] = v; return o; }
function hookExport(exports, key, operation) {
    var orig = exports[key], call3 = operation.call3, call2 = operation.call2, call1 = operation.call1, call0 = operation.call0;
    var patched = typeof call0 === "function" && typeof call1 === "function" ?
        function (a) { var n = arguments.length; return n === 0 ? call0(orig, this) : n === 1 ? call1(orig, this, a) : operation(orig, this, arguments); } :
        typeof call3 === "function" ? function (a, b, c) { return arguments.length === 3 ? call3(orig, this, a, b, c) : operation(orig, this, arguments); } :
        typeof call2 === "function" && typeof call1 === "function" ?
        function (a, b) { var n = arguments.length; return n === 1 ? call1(orig, this, a) : n === 2 ? call2(orig, this, a, b) : operation(orig, this, arguments); } :
        typeof call2 === "function" ? function (a, b) { return arguments.length === 2 ? call2(orig, this, a, b) : operation(orig, this, arguments); } :
        typeof call1 === "function" ? function (a) { return arguments.length === 1 ? call1(orig, this, a) : operation(orig, this, arguments); } :
        function () { return operation(orig, this, arguments); };
    copyStatics(patched, orig);
    return replaceValue(exports, key, patched);
}
// ---- old (verbatim up to the active branch)
function oldHook(orig, self, args) {
    var params = args[0];
    if (!params || typeof params !== "object") return orig.apply(self, args);
    var active = enabled("hideBlocked") && (settings.hideBlockedBlocked || settings.hideBlockedIgnored || settings.hideBlockedReplies);
    var ver = active ? hideBlocked.version + ":" + (settings.hideBlockedBlocked ? 1 : 0) + (settings.hideBlockedIgnored ? 1 : 0) + (settings.hideBlockedReplies ? 1 : 0) : "";
    var mgr = params.chatManager, force = false;
    if (mgr && typeof mgr === "object") {
        if (mgr.__venusHideBlockedVer !== undefined && mgr.__venusHideBlockedVer !== ver) force = true;
        mgr.__venusHideBlockedVer = ver;
    }
    var messages = params.messages;
    if (!active || !messages || typeof messages.forEach !== "function") {
        if (!force) return orig.apply(self, args);
        var next = Array.from(args);
        next[0] = Object.assign({}, params, {forceRender: true});
        return orig.apply(self, next);
    }
    return orig.apply(self, args);
}
// ---- new: one-argument call without the arguments object
function newHook(orig, self, args) { return newHook.call1(orig, self, args[0]); }
newHook.call1 = function (orig, self, params) {
    if (!params || typeof params !== "object") return orig.call(self, params);
    var active = enabled("hideBlocked") && (settings.hideBlockedBlocked || settings.hideBlockedIgnored || settings.hideBlockedReplies);
    var ver = active ? hideBlocked.version + ":" + (settings.hideBlockedBlocked ? 1 : 0) + (settings.hideBlockedIgnored ? 1 : 0) + (settings.hideBlockedReplies ? 1 : 0) : "";
    var mgr = params.chatManager, force = false;
    if (mgr && typeof mgr === "object") {
        if (mgr.__venusHideBlockedVer !== undefined && mgr.__venusHideBlockedVer !== ver) force = true;
        mgr.__venusHideBlockedVer = ver;
    }
    var messages = params.messages;
    if (!active || !messages || typeof messages.forEach !== "function") {
        if (!force) return orig.call(self, params);
        return orig.call(self, Object.assign({}, params, {forceRender: true}));
    }
    return orig.call(self, params);
};
function mk() { return {default: function (p) { return p; }}; }
var a = hookExport(mk(), "default", oldHook), b = hookExport(mk(), "default", newHook);
var params = {chatManager: {}, messages: [1, 2, 3], forceRender: false};
var sink = 0;
bench("old stream x100, off", function () { for (var i = 0; i < 100; i++) if (a.default(params)) sink++; });
bench("new stream x100, off", function () { for (var i = 0; i < 100; i++) if (b.default(params)) sink++; });
