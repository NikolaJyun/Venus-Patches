// serverEdit getGuildIconURL / getGuildIconSource hooks: the usual call is one argument, an icon that isn't a token.
var SERVER_EDIT_ICON = "venus-edit:", serverEdit = {icons: new Map()};
function copyStatics() {}
function replaceValue(o, k, v) { o[k] = v; return o; }
function hookExport(exports, key, operation) {
    var orig = exports[key], call3 = operation.call3, call2 = operation.call2, call1 = operation.call1, call0 = operation.call0;
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
    return replaceValue({}, key, patched);
}
var guild = {id: "1", icon: "abcdef0123456789"};
var utilsOrig = {getGuildIconURL: function (g) { return "https://cdn/" + g.id + "/" + g.icon; }, getGuildIconSource: function (g) { return {uri: "https://cdn/" + g.id + "/" + g.icon}; }};
// ---- old
var tokenOld = function (args) { var icon = args[0] && args[0].icon; return typeof icon === "string" && icon.indexOf(SERVER_EDIT_ICON) === 0 ? icon : null; };
var oldURL = hookExport(utilsOrig, "getGuildIconURL", function (orig, self, args) {
    var icon = tokenOld(args);
    return icon ? serverEdit.icons.get(icon) || null : orig.apply(self, args);
});
var oldSrc = hookExport(utilsOrig, "getGuildIconSource", function (orig, self, args) {
    var icon = tokenOld(args);
    if (!icon) return orig.apply(self, args);
    var uri = serverEdit.icons.get(icon);
    return uri ? {uri: uri} : null;
});
// ---- new
function tokenOf(g) { var icon = g && g.icon; return typeof icon === "string" && icon.indexOf(SERVER_EDIT_ICON) === 0 ? icon : null; }
var urlOp = function (orig, self, args) {
    var icon = tokenOf(args[0]);
    return icon ? serverEdit.icons.get(icon) || null : orig.apply(self, args);
};
urlOp.call1 = function (orig, self, g) {
    var icon = tokenOf(g);
    return icon ? serverEdit.icons.get(icon) || null : orig.call(self, g);
};
var srcOp = function (orig, self, args) {
    var icon = tokenOf(args[0]);
    if (!icon) return orig.apply(self, args);
    var uri = serverEdit.icons.get(icon);
    return uri ? {uri: uri} : null;
};
srcOp.call1 = function (orig, self, g) {
    var icon = tokenOf(g);
    if (!icon) return orig.call(self, g);
    var uri = serverEdit.icons.get(icon);
    return uri ? {uri: uri} : null;
};
var newURL = hookExport(utilsOrig, "getGuildIconURL", urlOp);
var newSrc = hookExport(utilsOrig, "getGuildIconSource", srcOp);
bench("old getGuildIconURL x100", function () { for (var i = 0; i < 100; i++) oldURL.getGuildIconURL(guild); });
bench("new getGuildIconURL x100", function () { for (var i = 0; i < 100; i++) newURL.getGuildIconURL(guild); });
bench("old getGuildIconSource x100", function () { for (var i = 0; i < 100; i++) oldSrc.getGuildIconSource(guild); });
bench("new getGuildIconSource x100", function () { for (var i = 0; i < 100; i++) newSrc.getGuildIconSource(guild); });
