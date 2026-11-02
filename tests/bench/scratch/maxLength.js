// getMaxMessageLength() and useMessageMaxLength() take no argument (Discord 351.11) and run on every chat input render.
// Split long messages built in but turned off (the common case).
var settings = {splitMessages: false}, features = {splitMessages: true};
var featureTable = Object.create(null);
function enabled(key) { return !!settings[key] && !!features[key]; }
function copyStatics() {}
function replaceValue(o, k, v) { o[k] = v; return o; }
var React = {}, SPLIT_UNLIMITED = 1e9;
function useSettings() {}
function messageLimit() { return 2000; }
function hook(exports, key, operation) {
    var orig = exports[key], call0 = operation.call0;
    var patched = typeof call0 === "function" ?
        function () { return arguments.length === 0 ? call0(orig, this) : operation(orig, this, arguments); } :
        function () { return operation(orig, this, arguments); };
    copyStatics(patched, orig);
    return replaceValue(exports, key, patched);
}
function mk() { return {getMaxMessageLength: function () { return 2000; }, "default": function () { return 2000; }}; }
// ---- old
var bigOld = function (orig, self, args) {
    var value = orig.apply(self, args);
    if (enabled("splitMessages")) return SPLIT_UNLIMITED;
    return value === SPLIT_UNLIMITED ? messageLimit() : value;
};
var o = mk();
o = hook(o, "getMaxMessageLength", bigOld);
o = hook(o, "default", function (orig, self, args) { if (React) useSettings("splitMessages"); return bigOld(orig, self, args); });
// ---- new
function bigResult(value) {
    if (enabled("splitMessages")) return SPLIT_UNLIMITED;
    return value === SPLIT_UNLIMITED ? messageLimit() : value;
}
var bigNew = function (orig, self, args) { return bigResult(orig.apply(self, args)); };
bigNew.call0 = function (orig, self) { return bigResult(orig.call(self)); };
var hookNew = function (orig, self, args) { if (React) useSettings("splitMessages"); return bigResult(orig.apply(self, args)); };
hookNew.call0 = function (orig, self) { if (React) useSettings("splitMessages"); return bigResult(orig.call(self)); };
var n = mk();
n = hook(n, "getMaxMessageLength", bigNew);
n = hook(n, "default", hookNew);
var sink = 0;
bench("old max length x2 x100", function () { for (var i = 0; i < 100; i++) { sink += o.getMaxMessageLength(); sink += o["default"](); } });
bench("new max length x2 x100", function () { for (var i = 0; i < 100; i++) { sink += n.getMaxMessageLength(); sink += n["default"](); } });
