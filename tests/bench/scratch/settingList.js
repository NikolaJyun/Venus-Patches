// toSettingListItems(node, b) takes two arguments (Discord 351.11) and runs for every settings screen render.
// Remove anything built in but nothing removed (the common case): the hook only passes the call through.
var settings = {hideAnything: true, hideAnythingSpots: ""}, features = {hideAnything: true};
var featureTable = Object.create(null);
function enabled(key) { return !!settings[key] && !!features[key]; }
function copyStatics() {}
function replaceValue(o, k, v) { o[k] = v; return o; }
function hiddenSpots() { return new Set(); }
function settingRemovable() { return false; }
function cloneWith(o, k, v) { var c = Object.assign({}, o); c[k] = v; return c; }
function hook(exports, key, operation) {
    var orig = exports[key], call2 = operation.call2, call1 = operation.call1;
    var patched = typeof call2 === "function" && typeof call1 === "function" ?
        function (a, b) { var n = arguments.length; return n === 1 ? call1(orig, this, a) : n === 2 ? call2(orig, this, a, b) : operation(orig, this, arguments); } :
        typeof call2 === "function" ?
        function (a, b) { return arguments.length === 2 ? call2(orig, this, a, b) : operation(orig, this, arguments); } :
        function () { return operation(orig, this, arguments); };
    copyStatics(patched, orig);
    return replaceValue(exports, key, patched);
}
function listOld(orig, self, args) {
    var node = args[0];
    if (!node || !Array.isArray(node.sections) || !settings.hideAnythingSpots || !enabled("hideAnything")) return orig.apply(self, args);
    return orig.apply(self, args);
}
function listNew(orig, self, args) {
    var node = args[0];
    if (!node || !Array.isArray(node.sections) || !settings.hideAnythingSpots || !enabled("hideAnything")) return orig.apply(self, args);
    return orig.apply(self, args);
}
listNew.call2 = function (orig, self, node, b) {
    if (!node || !Array.isArray(node.sections) || !settings.hideAnythingSpots || !enabled("hideAnything")) return orig.call(self, node, b);
    return listNew(orig, self, [node, b]);
};
var node = {sections: [{settings: ["a", "b"]}]}, result = [1];
function mk() { return {toSettingListItems: function (n, b) { return result; }}; }
var o = hook(mk(), "toSettingListItems", listOld), n = hook(mk(), "toSettingListItems", listNew);
var sink = 0;
bench("old toSettingListItems x100", function () { for (var i = 0; i < 100; i++) if (o.toSettingListItems(node, 1)) sink++; });
bench("new toSettingListItems x100", function () { for (var i = 0; i < 100; i++) if (n.toSettingListItems(node, 1)) sink++; });
