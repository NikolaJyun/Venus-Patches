// useRedesignGuildHeaderHeight(guild): read on every server header render. Hide anything OFF (common).
var settings = {}, features = {hideAnything: true};
function enabled(key) { return !!settings[key] && !!features[key]; }
function copyStatics() {}
function replaceValue(o, k, v) { o[k] = v; return o; }
var React = {useState: function (v) { return [v, function () {}]; }, useEffect: function () {}};
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
function serverHeaderEmpty() { return false; }
function inspectedExport() { return 32; }
function heightOld(orig, self, args) {
    useSettings("hideAnything");
    var height = orig.apply(self, args), guild = args[0];
    if (typeof height !== "number" || !enabled("hideAnything") || !serverHeaderEmpty()) return height;
    if (!guild || typeof guild.id !== "string" || !/^\d{15,}$/.test(guild.id)) return height;
    var button = inspectedExport(5484, "SMALL_BUTTON_HEIGHT"), margin = inspectedExport(11895, "SEARCH_BAR_MARGIN_BOTTOM");
    return Math.max(0, height - (typeof button === "number" ? button : 32) - (typeof margin === "number" ? margin : 0));
}
function heightFinish(height, guild) {
    if (typeof height !== "number" || !enabled("hideAnything") || !serverHeaderEmpty()) return height;
    if (!guild || typeof guild.id !== "string" || !/^\d{15,}$/.test(guild.id)) return height;
    var button = inspectedExport(5484, "SMALL_BUTTON_HEIGHT"), margin = inspectedExport(11895, "SEARCH_BAR_MARGIN_BOTTOM");
    return Math.max(0, height - (typeof button === "number" ? button : 32) - (typeof margin === "number" ? margin : 0));
}
function heightNew(orig, self, args) { useSettings("hideAnything"); return heightFinish(orig.apply(self, args), args[0]); }
heightNew.call1 = function (orig, self, guild) { useSettings("hideAnything"); return heightFinish(orig.call(self, guild), guild); };
function hookOld(exports, key, operation) {
    var orig = exports[key];
    return replaceValue(exports, key, function () { return operation(orig, this, arguments); });
}
function hookNew(exports, key, operation) {
    var orig = exports[key], call1 = operation.call1;
    var patched = typeof call1 === "function" ?
        function (a) { return arguments.length === 1 ? call1(orig, this, a) : operation(orig, this, arguments); } :
        function () { return operation(orig, this, arguments); };
    return replaceValue(exports, key, patched);
}
var base = function (guild) { return 120; };
var o = hookOld({f: base}, "f", heightOld), n = hookNew({f: base}, "f", heightNew);
var guild = {id: "123456789012345678"}, sink = 0;
bench("old useRedesignGuildHeaderHeight x100", function () { for (var i = 0; i < 100; i++) sink += o.f(guild); });
bench("new useRedesignGuildHeaderHeight x100", function () { for (var i = 0; i < 100; i++) sink += n.f(guild); });
