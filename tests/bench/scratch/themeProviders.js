// rootThemeContextProvider / nestedThemeContextProvider: wrap Discord's theme providers, which re-render with the app and the chat.
// Typical state: a theme feature is on but nothing changed (no revision), so only the wrapper's own overhead shows.
// useSettings and the other hooks are stand-ins (identical cost in old and new).
var features = {customThemes: true, materialYou: false, iconPacks: false}, customThemes = {revision: 0}, materialYou = {nativeSlot: null}, sink = 0;
function useSettings() { sink++; }
function customThemesActiveEntry() { return null; }
function nativeThemeSlot() { return "dark"; }
function myNativeSync() {}
function themeContextRekey(tree) {
    if (customThemes.revision <= 0 || !tree || !tree.props || !tree.props.value || typeof tree.props.value !== "object" || typeof tree.props.value.key !== "string") return tree;
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
// ---- old
function rootOld(orig, self, args) {
    if (features.customThemes || features.materialYou) useSettings("customThemes");
    if (features.iconPacks) useSettings("iconPacks");
    if (features.customThemes && materialYou.nativeSlot && customThemesActiveEntry() && nativeThemeSlot() !== materialYou.nativeSlot) myNativeSync(customThemesActiveEntry());
    return themeContextRekey(orig.apply(self, args));
}
function nestedOld(orig, self, args) { return themeContextRekey(orig.apply(self, args)); }
// ---- new
function rootPrepare() {
    if (features.customThemes || features.materialYou) useSettings("customThemes");
    if (features.iconPacks) useSettings("iconPacks");
    if (features.customThemes && materialYou.nativeSlot && customThemesActiveEntry() && nativeThemeSlot() !== materialYou.nativeSlot) myNativeSync(customThemesActiveEntry());
}
function rootNew(orig, self, args) { rootPrepare(); return themeContextRekey(orig.apply(self, args)); }
rootNew.call1 = function (orig, self, a) { rootPrepare(); return themeContextRekey(orig.call(self, a)); };
rootNew.call2 = function (orig, self, a, b) { rootPrepare(); return themeContextRekey(orig.call(self, a, b)); };
function nestedNew(orig, self, args) { return themeContextRekey(orig.apply(self, args)); }
nestedNew.call1 = function (orig, self, a) { return themeContextRekey(orig.call(self, a)); };
nestedNew.call2 = function (orig, self, a, b) { return themeContextRekey(orig.call(self, a, b)); };
var ro = hookExport(mk(), "default", rootOld).default, rn = hookExport(mk(), "default", rootNew).default;
var no = hookExport(mk(), "default", nestedOld).default, nn = hookExport(mk(), "default", nestedNew).default;
var p = {a: 1};
bench("old root provider x100", function () { for (var i = 0; i < 100; i++) ro(p, undefined); });
bench("new root provider x100", function () { for (var i = 0; i < 100; i++) rn(p, undefined); });
bench("old nested provider x100", function () { for (var i = 0; i < 100; i++) no(p, undefined); });
bench("new nested provider x100", function () { for (var i = 0; i < 100; i++) nn(p, undefined); });
