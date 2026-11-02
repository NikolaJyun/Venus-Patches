// platformIndicators row hooks: DM rows, member rows and names render through them. Typical state: feature on, this placement off,
// or the row has nothing to add. useSettings is a stand-in (same cost both sides).
var settings = {platformIndicators: true, piUserList: false, piDmHeader: false, piProfile: false}, features = {platformIndicators: true}, featureTable = Object.create(null);
function featureFor(k) { return k; }
function enabled(key) {
    if (!settings[key]) return false;
    var feature = featureTable[key] || featureFor(key);
    return feature === key ? !!features[key] : !!(features[feature] && settings[feature]);
}
var React = {}, RN = {}, sink = 0;
function useSettings() { sink++; }
function placePlatformTree(tree, props, option) {
    if (!enabled("platformIndicators") || (option && !settings[option]) || !React || !RN || !tree) return tree;
    return tree;
}
function copyStatics() {}
function replaceValue(o, k, v) { o[k] = v; return o; }
function hookExport(exports, key, operation) {
    var orig = exports[key], call2 = operation.call2, call1 = operation.call1;
    var patched = typeof call2 === "function" && typeof call1 === "function" ?
        function (a, b) { var n = arguments.length; return n === 1 ? call1(orig, this, a) : n === 2 ? call2(orig, this, a, b) : operation(orig, this, arguments); } :
        typeof call2 === "function" ? function (a, b) { return arguments.length === 2 ? call2(orig, this, a, b) : operation(orig, this, arguments); } :
        function () { return operation(orig, this, arguments); };
    copyStatics(patched, orig);
    return replaceValue(exports, key, patched);
}
var rendered = {type: "View", props: {children: null}};
function mk() { return {default: function (props, ref) { return rendered; }}; }
var props = {channel: {type: 1, recipients: ["1"]}};
// ---- old
function placementOld(orig, self, args, option) { if (React) useSettings("platformIndicators"); return placePlatformTree(orig.apply(self, args), args[0] || {}, option); }
function dmRowOld(orig, self, args) {
    if (React) useSettings("platformIndicators");
    var tree = orig.apply(self, args), channel = args[0] && args[0].channel;
    if (!enabled("platformIndicators") || !settings.piUserList || !React || !RN || !tree || !channel) return tree;
    return tree;
}
// ---- new
function placementNew(orig, self, args, option) { if (React) useSettings("platformIndicators"); return placePlatformTree(orig.apply(self, args), args[0] || {}, option); }
function placementHook(option) {
    var op = function (orig, self, args) { return placementNew(orig, self, args, option); };
    op.call1 = function (orig, self, a) { if (React) useSettings("platformIndicators"); return placePlatformTree(orig.call(self, a), a || {}, option); };
    op.call2 = function (orig, self, a, b) { if (React) useSettings("platformIndicators"); return placePlatformTree(orig.call(self, a, b), a || {}, option); };
    return op;
}
function dmRowDone(tree, props) {
    var channel = props && props.channel;
    if (!enabled("platformIndicators") || !settings.piUserList || !React || !RN || !tree || !channel) return tree;
    return tree;
}
function dmRowNew(orig, self, args) { if (React) useSettings("platformIndicators"); return dmRowDone(orig.apply(self, args), args[0]); }
dmRowNew.call1 = function (orig, self, a) { if (React) useSettings("platformIndicators"); return dmRowDone(orig.call(self, a), a); };
dmRowNew.call2 = function (orig, self, a, b) { if (React) useSettings("platformIndicators"); return dmRowDone(orig.call(self, a, b), a); };
var po = hookExport(mk(), "default", function (orig, self, args) { return placementOld(orig, self, args, "piUserList"); }).default;
var pn = hookExport(mk(), "default", placementHook("piUserList")).default;
var dO = hookExport(mk(), "default", dmRowOld).default, dN = hookExport(mk(), "default", dmRowNew).default;
bench("old member row x100", function () { for (var i = 0; i < 100; i++) po(props, undefined); });
bench("new member row x100", function () { for (var i = 0; i < 100; i++) pn(props, undefined); });
bench("old DM row x100", function () { for (var i = 0; i < 100; i++) dO(props, undefined); });
bench("new DM row x100", function () { for (var i = 0; i < 100; i++) dN(props, undefined); });
