// rolesCard / statusBubble: hideWhole(...) used to be built on every render of the roles card; now built once, plus call1/call2 paths.
var settings = {hideAnything: true, hideAnythingSpots: "chat.apps"}, features = {hideAnything: true}, featureTable = Object.create(null);
function featureFor(k) { return k; }
function enabled(key) {
    if (!settings[key]) return false;
    var feature = featureTable[key] || featureFor(key);
    return feature === key ? !!features[key] : !!(features[feature] && settings[feature]);
}
var hideSpotCache = null, hideEdit = {on: false}, sink = 0;
function hiddenSpots() { var text = settings.hideAnythingSpots || ""; if (!hideSpotCache || hideSpotCache.text !== text) hideSpotCache = {text: text, set: new Set(text ? text.split(",") : [])}; return hideSpotCache.set; }
function spotHidden(key) { return !!settings.hideAnythingSpots && enabled("hideAnything") && hiddenSpots().has(key); }
function hideEditing() { return hideEdit.on && enabled("hideAnything"); }
function useSettings() { sink++; }
function hideMarked(n) { return n; }
function hideWhole(key) {
    var finish = function (r) {
        if (!r || !enabled("hideAnything")) return r;
        if (spotHidden(key)) return null;
        return hideEditing() ? hideMarked(r, key) : r;
    };
    var op = function (orig, self, args) { useSettings("hideAnything"); return finish(orig.apply(self, args)); };
    op.call1 = function (orig, self, a) { useSettings("hideAnything"); return finish(orig.call(self, a)); };
    op.call2 = function (orig, self, a, b) { useSettings("hideAnything"); return finish(orig.call(self, a, b)); };
    return op;
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
var props = {user: {id: "1"}};
// ---- old
function rolesOld(orig, self, args) {
    var p = args[0];
    return p && ("user" in p || "userId" in p || "guildMember" in p) ? hideWhole("profile.roles")(orig, self, args) : orig.apply(self, args);
}
// ---- new
var rolesWhole = hideWhole("profile.roles");
function isProfileRoles(p) { return p && ("user" in p || "userId" in p || "guildMember" in p); }
function rolesNew(orig, self, args) { return isProfileRoles(args[0]) ? rolesWhole(orig, self, args) : orig.apply(self, args); }
rolesNew.call1 = function (orig, self, p) { return isProfileRoles(p) ? rolesWhole.call1(orig, self, p) : orig.call(self, p); };
rolesNew.call2 = function (orig, self, p, r) { return isProfileRoles(p) ? rolesWhole.call2(orig, self, p, r) : orig.call(self, p, r); };
var ro = hookExport(mk(), "default", rolesOld).default, rn = hookExport(mk(), "default", rolesNew).default;
bench("old rolesCard x100", function () { for (var i = 0; i < 100; i++) ro(props, undefined); });
bench("new rolesCard x100", function () { for (var i = 0; i < 100; i++) rn(props, undefined); });
