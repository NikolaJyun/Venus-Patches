// canUserUse (catalogEligibility) and premiumOverride hooks: old (arguments + apply, currentUser() first) vs new (call2/call1 fast path, user read only when needed)
var settings = {emojis: false, appIcons: false, nitroThemes: false};
var features = {emojis: true, appIcons: true, nitroThemes: true};
var featureTable = Object.create(null);
function featureFor(k) { return k; }
function enabled(key) {
    if (!settings[key]) return false;
    var feature = featureTable[key] || featureFor(key);
    return feature === key ? !!features[key] : !!(features[feature] && settings[feature]);
}
var me = {id: "123"}, other = {id: "456"};
var userStore = {user: me, getCurrentUser: function () { return this.user; }};
function currentUser() { return userStore && userStore.getCurrentUser(); }
var nativeCapabilities = 0;
var emojiCatalog = {EMOJIS_EVERYWHERE: 1, ANIMATED_EMOJIS: 2, APP_ICONS: 3, CLIENT_THEMES: 4};

function copyStatics() {}
function replaceValue(o, k, v) { o[k] = v; return o; }
function hookExport(exports, key, operation) {
    var orig = exports && exports[key];
    var call2 = operation.call2, call1 = operation.call1;
    var patched = typeof call2 === "function" && typeof call1 === "function" ?
        function (a, b) {
            var n = arguments.length;
            return n === 1 ? call1(orig, this, a) : n === 2 ? call2(orig, this, a, b) : operation(orig, this, arguments);
        } :
        typeof call2 === "function" ?
        function (a, b) { return arguments.length === 2 ? call2(orig, this, a, b) : operation(orig, this, arguments); } :
        typeof call1 === "function" ?
        function (a) { return arguments.length === 1 ? call1(orig, this, a) : operation(orig, this, arguments); } :
        function () { return operation(orig, this, arguments); };
    copyStatics(patched, orig);
    return replaceValue(exports, key, patched);
}

// ---- old
function catalogOld(orig, self, args) {
    var user = currentUser(), feature = args[0];
    if (!nativeCapabilities && user && args[1] && args[1].id === user.id && emojiCatalog) {
        if (enabled("emojis") && (feature === emojiCatalog.EMOJIS_EVERYWHERE || feature === emojiCatalog.ANIMATED_EMOJIS)) return true;
        if (enabled("appIcons") && feature === emojiCatalog.APP_ICONS) return true;
        if (enabled("nitroThemes") && feature === emojiCatalog.CLIENT_THEMES) return true;
    }
    return orig.apply(self, args);
}
function premiumOld(key, setting) {
    return function (orig, self, args) {
        var user = currentUser();
        return enabled(setting) && user && args[0] && args[0].id === user.id ? true : orig.apply(self, args);
    };
}
// ---- new (verbatim from bootstrap.js)
function catalogGrants(feature, target) {
    if (nativeCapabilities || !target || !emojiCatalog) return false;
    var user = currentUser();
    if (!user || target.id !== user.id) return false;
    if (enabled("emojis") && (feature === emojiCatalog.EMOJIS_EVERYWHERE || feature === emojiCatalog.ANIMATED_EMOJIS)) return true;
    if (enabled("appIcons") && feature === emojiCatalog.APP_ICONS) return true;
    return enabled("nitroThemes") && feature === emojiCatalog.CLIENT_THEMES;
}
function catalogNew(orig, self, args) { return catalogGrants(args[0], args[1]) || orig.apply(self, args); }
catalogNew.call2 = function (orig, self, feature, target) { return catalogGrants(feature, target) || orig.call(self, feature, target); };
function premiumNew(key, setting) {
    var grants = function (target) {
        if (!target || !enabled(setting)) return false;
        var user = currentUser();
        return !!user && target.id === user.id;
    };
    var operation = function (orig, self, args) { return grants(args[0]) || orig.apply(self, args); };
    operation.call1 = function (orig, self, target) { return grants(target) || orig.call(self, target); };
    return operation;
}

function mk(obj) { return {canUserUse: function (f, u) { return f > 100 && u === me; }, canUseClientThemes: function (u) { return u === other; }}; }
var oldCat = hookExport(mk(), "canUserUse", catalogOld);
var newCat = hookExport(mk(), "canUserUse", catalogNew);
var oldPrem = hookExport(mk(), "canUseClientThemes", premiumOld("canUseClientThemes", "nitroThemes"));
var newPrem = hookExport(mk(), "canUseClientThemes", premiumNew("canUseClientThemes", "nitroThemes"));
var sink = 0;
function loopCat(o) { return function () { for (var i = 0; i < 100; i++) { if (o.canUserUse(50 + (i & 3), i & 1 ? me : other)) sink++; } }; }
function loopPrem(o) { return function () { for (var i = 0; i < 100; i++) { if (o.canUseClientThemes(i & 1 ? me : other)) sink++; } }; }

// feature switched off (the common case): settings all false
bench("old canUserUse x100, off", loopCat(oldCat));
bench("new canUserUse x100, off", loopCat(newCat));
bench("old canUseClientThemes x100, off", loopPrem(oldPrem));
bench("new canUseClientThemes x100, off", loopPrem(newPrem));
