// SelectedChannelStore.getChannelId() / getChannelId(guildId) with Hidden channels off (the common case).
var settings = {hiddenChannels: false}, features = {hiddenChannels: true};
function enabled(key) { return !!settings[key] && !!features[key]; }
function copyStatics() {}
function replaceValue(o, k, v) { o[k] = v; return o; }
var hiddenConfirmed = new Set();
function hiddenChannel(id) { return false; }
function receivedChannel(id) { return null; }
var guildChannels = null;
// ---- old hookExport (current)
function hookOld(exports, key, operation) {
    var orig = exports[key], call3 = operation.call3, call2 = operation.call2, call1 = operation.call1;
    var patched = typeof call3 === "function" ?
        function (a, b, c) { return arguments.length === 3 ? call3(orig, this, a, b, c) : operation(orig, this, arguments); } :
        typeof call2 === "function" && typeof call1 === "function" ?
        function (a, b) { var n = arguments.length; return n === 1 ? call1(orig, this, a) : n === 2 ? call2(orig, this, a, b) : operation(orig, this, arguments); } :
        typeof call2 === "function" ? function (a, b) { return arguments.length === 2 ? call2(orig, this, a, b) : operation(orig, this, arguments); } :
        typeof call1 === "function" ? function (a) { return arguments.length === 1 ? call1(orig, this, a) : operation(orig, this, arguments); } :
        function () { return operation(orig, this, arguments); };
    copyStatics(patched, orig);
    return replaceValue(exports, key, patched);
}
// ---- new hookExport: call0 + call1 together
function hookNew(exports, key, operation) {
    var orig = exports[key], call0 = operation.call0, call3 = operation.call3, call2 = operation.call2, call1 = operation.call1;
    var patched = typeof call0 === "function" && typeof call1 === "function" ?
        function (a) { var n = arguments.length; return n === 0 ? call0(orig, this) : n === 1 ? call1(orig, this, a) : operation(orig, this, arguments); } :
        typeof call3 === "function" ?
        function (a, b, c) { return arguments.length === 3 ? call3(orig, this, a, b, c) : operation(orig, this, arguments); } :
        typeof call2 === "function" && typeof call1 === "function" ?
        function (a, b) { var n = arguments.length; return n === 1 ? call1(orig, this, a) : n === 2 ? call2(orig, this, a, b) : operation(orig, this, arguments); } :
        typeof call2 === "function" ? function (a, b) { return arguments.length === 2 ? call2(orig, this, a, b) : operation(orig, this, arguments); } :
        typeof call1 === "function" ? function (a) { return arguments.length === 1 ? call1(orig, this, a) : operation(orig, this, arguments); } :
        function () { return operation(orig, this, arguments); };
    copyStatics(patched, orig);
    return replaceValue(exports, key, patched);
}
function selOld(orig, self, args) {
    var id = orig.apply(self, args);
    if (!enabled("hiddenChannels") || typeof id !== "string" || hiddenConfirmed.has(id) || !hiddenChannel(id)) return id;
    return null;
}
function selFix(id, guild) {
    if (!enabled("hiddenChannels") || typeof id !== "string" || hiddenConfirmed.has(id) || !hiddenChannel(id)) return id;
    return null;
}
function selNew(orig, self, args) { return selFix(orig.apply(self, args), args[0]); }
selNew.call0 = function (orig, self) { return selFix(orig.call(self), undefined); };
selNew.call1 = function (orig, self, guild) { return selFix(orig.call(self, guild), guild); };
function mk() { return {getChannelId: function (g) { return "123"; }}; }
var a = hookOld(mk(), "getChannelId", selOld), b = hookNew(mk(), "getChannelId", selNew);
var sink = 0;
bench("old getChannelId() x100", function () { for (var i = 0; i < 100; i++) if (a.getChannelId()) sink++; });
bench("new getChannelId() x100", function () { for (var i = 0; i < 100; i++) if (b.getChannelId()) sink++; });
bench("old getChannelId(guild) x100", function () { for (var i = 0; i < 100; i++) if (a.getChannelId("9")) sink++; });
bench("new getChannelId(guild) x100", function () { for (var i = 0; i < 100; i++) if (b.getChannelId("9")) sink++; });
