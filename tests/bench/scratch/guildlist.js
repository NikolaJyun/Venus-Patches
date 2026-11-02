// GuildStore.getGuilds() / getGuildsArray(): no arguments, read all over the server list. Edit servers locally with nothing edited (common case).
var settings = {serverEdit: true}, features = {serverEdit: true};
function enabled(key) { return !!settings[key] && !!features[key]; }
var serverEdits = new Map(), serverEdit = {version: 0};
function serverEditOn() { return serverEdits.size > 0 && enabled("serverEdit"); }
function copyStatics() {}
function replaceValue(o, k, v) { o[k] = v; return o; }
function hookOld(exports, key, operation) {
    var orig = exports[key], call3 = operation.call3, call2 = operation.call2, call1 = operation.call1, call0 = operation.call0;
    var patched = typeof call0 === "function" && typeof call1 === "function" ?
        function (a) { var n = arguments.length; return n === 0 ? call0(orig, this) : n === 1 ? call1(orig, this, a) : operation(orig, this, arguments); } :
        typeof call3 === "function" ? function (a, b, c) { return arguments.length === 3 ? call3(orig, this, a, b, c) : operation(orig, this, arguments); } :
        function () { return operation(orig, this, arguments); };
    copyStatics(patched, orig);
    return replaceValue(exports, key, patched);
}
// ---- new hookExport: call0 alone is enough
function hookNew(exports, key, operation) {
    var orig = exports[key], call3 = operation.call3, call2 = operation.call2, call1 = operation.call1, call0 = operation.call0;
    var patched = typeof call0 === "function" ?
        (typeof call1 === "function" ?
            function (a) { var n = arguments.length; return n === 0 ? call0(orig, this) : n === 1 ? call1(orig, this, a) : operation(orig, this, arguments); } :
            function () { return arguments.length === 0 ? call0(orig, this) : operation(orig, this, arguments); }) :
        typeof call3 === "function" ? function (a, b, c) { return arguments.length === 3 ? call3(orig, this, a, b, c) : operation(orig, this, arguments); } :
        function () { return operation(orig, this, arguments); };
    copyStatics(patched, orig);
    return replaceValue(exports, key, patched);
}
function listOld(orig, self, args, array) {
    var list = orig.apply(self, args);
    if (!list || typeof list !== "object" || !serverEditOn()) return list;
    return list;
}
function listFix(list) {
    if (!list || typeof list !== "object" || !serverEditOn()) return list;
    return list;
}
function arrOld(orig, self, args) { return listOld(orig, self, args, true); }
function arrNew(orig, self, args) { return listFix(orig.apply(self, args)); }
arrNew.call0 = function (orig, self) { return listFix(orig.call(self)); };
var guilds = []; for (var i = 0; i < 100; i++) guilds.push({id: "" + i});
function mk() { return {getGuildsArray: function () { return guilds; }}; }
var a = hookOld(mk(), "getGuildsArray", arrOld), b = hookNew(mk(), "getGuildsArray", arrNew);
var sink = 0;
bench("old getGuildsArray x100", function () { for (var i = 0; i < 100; i++) if (a.getGuildsArray()) sink++; });
bench("new getGuildsArray x100", function () { for (var i = 0; i < 100; i++) if (b.getGuildsArray()) sink++; });
