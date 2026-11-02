// hiddenInfo: wraps ChannelInfo, rendered for every channel row as (props) or (props, ref). Hidden channels ON, channel not locked (common).
var settings = {hiddenChannels: true}, features = {hiddenChannels: true};
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
function tr(s) { return s; }
function hiddenName(c) { return c.name; }
function hiddenMetadata(channel) {
    if (!enabled("hiddenChannels")) return false;
    return !!(channel && channel.guild_id && channel.locked);
}
function infoOld(orig, self, args) {
    if (React) useSettings("hiddenChannels");
    var tree = orig.apply(self, args), channel = args[0] && args[0].channel;
    if (!tree || !React || !RN || !hiddenMetadata(channel)) return tree;
    return el(RN.View, {accessible: true, accessibilityLabel: hiddenName(channel) + ", " + tr("locked")}, tree);
}
function infoFinish(tree, props) {
    var channel = props && props.channel;
    if (!tree || !React || !RN || !hiddenMetadata(channel)) return tree;
    return el(RN.View, {accessible: true, accessibilityLabel: hiddenName(channel) + ", " + tr("locked")}, tree);
}
function infoNew(orig, self, args) { if (React) useSettings("hiddenChannels"); return infoFinish(orig.apply(self, args), args[0]); }
infoNew.call1 = function (orig, self, a) { if (React) useSettings("hiddenChannels"); return infoFinish(orig.call(self, a), a); };
infoNew.call2 = function (orig, self, a, b) { if (React) useSettings("hiddenChannels"); return infoFinish(orig.call(self, a, b), a); };
function hookOld(exports, key, operation) {
    var orig = exports[key];
    return replaceValue(exports, key, function () { return operation(orig, this, arguments); });
}
function hookNew(exports, key, operation) {
    var orig = exports[key], call2 = operation.call2, call1 = operation.call1;
    var patched = typeof call2 === "function" && typeof call1 === "function" ?
        function (a, b) { var n = arguments.length; return n === 1 ? call1(orig, this, a) : n === 2 ? call2(orig, this, a, b) : operation(orig, this, arguments); } :
        function () { return operation(orig, this, arguments); };
    return replaceValue(exports, key, patched);
}
var comp = function (props, ref) { return {type: "View", props: props}; };
var o = hookOld({f: comp}, "f", infoOld), n = hookNew({f: comp}, "f", infoNew);
var props = {channel: {id: "1", guild_id: "2", name: "general", locked: false}}, sink = 0;
bench("old hiddenInfo render x100", function () { for (var i = 0; i < 100; i++) sink += o.f(props, undefined).props.channel.id.length; });
bench("new hiddenInfo render x100", function () { for (var i = 0; i < 100; i++) sink += n.f(props, undefined).props.channel.id.length; });
