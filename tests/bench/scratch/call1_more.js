// One-argument hooks with the feature off: isSuspiciousDownload (alwaysTrustFile, once per attachment), the gesture banner
// components (hideWhenGestures, once per render) and useRedesignGuildHeaderHeight (guildHeaderHeight, once per server header render).
var settings = {alwaysTrust: false, gestures: false, hideAnything: false}, features = {alwaysTrust: true, gestures: true, hideAnything: true};
function enabled(key) { return !!settings[key] && !!features[key]; }
var React = null;
function useSettings() {}
function copyStatics() {}
function replaceValue(o, k, v) { o[k] = v; return o; }
function hookExport(exports, key, operation) {
    var orig = exports[key], call3 = operation.call3, call2 = operation.call2, call1 = operation.call1, call0 = operation.call0;
    var patched = typeof call0 === "function" && typeof call1 === "function" ?
        function (a) { var n = arguments.length; return n === 0 ? call0(orig, this) : n === 1 ? call1(orig, this, a) : operation(orig, this, arguments); } :
        typeof call1 === "function" ? function (a) { return arguments.length === 1 ? call1(orig, this, a) : operation(orig, this, arguments); } :
        function () { return operation(orig, this, arguments); };
    copyStatics(patched, orig);
    return replaceValue(exports, key, patched);
}
function serverHeaderEmpty() { return false; }
// ---- old
function fileOld(orig, self, args) { return enabled("alwaysTrust") && settings.alwaysTrustFiles ? null : orig.apply(self, args); }
function gestOld(orig, self, args) { if (React) useSettings("gestures"); return enabled("gestures") ? null : orig.apply(self, args); }
function headerOld(orig, self, args) {
    useSettings("hideAnything");
    var height = orig.apply(self, args), guild = args[0];
    if (typeof height !== "number" || !enabled("hideAnything") || !serverHeaderEmpty()) return height;
    return height - 32;
}
// ---- new
function fileNew(orig, self, args) { return enabled("alwaysTrust") && settings.alwaysTrustFiles ? null : orig.apply(self, args); }
fileNew.call1 = function (orig, self, name) { return enabled("alwaysTrust") && settings.alwaysTrustFiles ? null : orig.call(self, name); };
function gestNew(orig, self, args) { if (React) useSettings("gestures"); return enabled("gestures") ? null : orig.apply(self, args); }
gestNew.call1 = function (orig, self, props) { if (React) useSettings("gestures"); return enabled("gestures") ? null : orig.call(self, props); };
function headerHeight(height) {
    if (typeof height !== "number" || !enabled("hideAnything") || !serverHeaderEmpty()) return height;
    return height - 32;
}
function headerNew(orig, self, args) { useSettings("hideAnything"); return headerHeight(orig.apply(self, args)); }
headerNew.call1 = function (orig, self, guild) { useSettings("hideAnything"); return headerHeight(orig.call(self, guild)); };
function mk() { return {isSuspiciousDownload: function (n) { return n; }, Banner: function (p) { return p; }, useHeight: function (g) { return 40; }}; }
var o = mk(), n = mk();
o = hookExport(o, "isSuspiciousDownload", fileOld); o = hookExport(o, "Banner", gestOld); o = hookExport(o, "useHeight", headerOld);
n = hookExport(n, "isSuspiciousDownload", fileNew); n = hookExport(n, "Banner", gestNew); n = hookExport(n, "useHeight", headerNew);
var props = {id: "1"}, sink = 0;
bench("old isSuspiciousDownload x100", function () { for (var i = 0; i < 100; i++) if (o.isSuspiciousDownload("a.zip")) sink++; });
bench("new isSuspiciousDownload x100", function () { for (var i = 0; i < 100; i++) if (n.isSuspiciousDownload("a.zip")) sink++; });
bench("old gesture banner x100", function () { for (var i = 0; i < 100; i++) if (o.Banner(props)) sink++; });
bench("new gesture banner x100", function () { for (var i = 0; i < 100; i++) if (n.Banner(props)) sink++; });
bench("old header height x100", function () { for (var i = 0; i < 100; i++) if (o.useHeight(props)) sink++; });
bench("new header height x100", function () { for (var i = 0; i < 100; i++) if (n.useHeight(props)) sink++; });
