// platformName: wraps Discord's DisplayName component (props) / (props, ref), rendered for every name on screen. Platform indicators ON
// but the profile option off (common): the arguments object + apply path vs call1/call2 fast paths.
var settings = {platformIndicators: true, piProfile: false}, features = {platformIndicators: true};
function enabled(key) { return !!settings[key] && !!features[key]; }
function copyStatics() {}
function replaceValue(o, k, v) { o[k] = v; return o; }
var React = {useState: function (v) { return [v, function () {}]; }, useEffect: function () {}}, RN = {View: "View"};
var notifyCount = 0, listeners = new Set();
function useSettings(key) {
    var s = React.useState(0), update = s[1], seen = notifyCount;
    React.useEffect(function () {
        var entry = {key: key, fn: function () { update(function (n) { return n + 1; }); }};
        listeners.add(entry);
        if (notifyCount !== seen) entry.fn();
        return function () { listeners["delete"](entry); };
    }, [key]);
}
function el() { return {args: arguments}; }
function PlatformBadges() {}
function platformOld(orig, self, args) {
    if (React) useSettings("platformIndicators");
    var tree = orig.apply(self, args), user = args[0] && args[0].user;
    if (!enabled("platformIndicators") || !settings.piProfile || !React || !RN || !tree || !user) return tree;
    return el(RN.View, {style: {flexDirection: "row"}}, tree, el(PlatformBadges, {userId: user.id}));
}
function platformFinish(tree, props) {
    var user = props && props.user;
    if (!enabled("platformIndicators") || !settings.piProfile || !React || !RN || !tree || !user) return tree;
    return el(RN.View, {style: {flexDirection: "row"}}, tree, el(PlatformBadges, {userId: user.id}));
}
function platformNew(orig, self, args) {
    if (React) useSettings("platformIndicators");
    return platformFinish(orig.apply(self, args), args[0]);
}
platformNew.call1 = function (orig, self, a) { if (React) useSettings("platformIndicators"); return platformFinish(orig.call(self, a), a); };
platformNew.call2 = function (orig, self, a, b) { if (React) useSettings("platformIndicators"); return platformFinish(orig.call(self, a, b), a); };
function hookOld(exports, key, operation) {
    var orig = exports[key];
    var patched = function () { return operation(orig, this, arguments); };
    return replaceValue(exports, key, patched);
}
function hookNew(exports, key, operation) {
    var orig = exports[key], call2 = operation.call2, call1 = operation.call1;
    var patched = typeof call2 === "function" && typeof call1 === "function" ?
        function (a, b) { var n = arguments.length; return n === 1 ? call1(orig, this, a) : n === 2 ? call2(orig, this, a, b) : operation(orig, this, arguments); } :
        function () { return operation(orig, this, arguments); };
    return replaceValue(exports, key, patched);
}
var comp = function (props, ref) { return {type: "Text", props: props}; };
var o = hookOld({f: comp}, "f", platformOld), n = hookNew({f: comp}, "f", platformNew);
var props = {user: {id: "1"}, name: "x"}, sink = 0;
bench("old platformName render x100", function () { for (var i = 0; i < 100; i++) sink += o.f(props, undefined).props.name.length; });
bench("new platformName render x100", function () { for (var i = 0; i < 100; i++) sink += n.f(props, undefined).props.name.length; });
