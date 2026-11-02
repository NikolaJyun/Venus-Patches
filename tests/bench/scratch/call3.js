// Hooks on 3-argument functions (getMobileOptimizedSrc(src, w, h), avatar URL builders): the arguments object + apply
// path vs a call3 fast path in hookExport. Features off (the common case).
var settings = {fullImages: false, fullImagesAvatars: false}, features = {fullImages: true};
function enabled(key) { return !!settings[key] && !!features[key]; }
function copyStatics() {}
function replaceValue(o, k, v) { o[k] = v; return o; }
// ---- old hookExport (verbatim shape)
function hookOld(exports, key, operation) {
    var orig = exports[key], call2 = operation.call2, call1 = operation.call1;
    var patched = typeof call2 === "function" && typeof call1 === "function" ?
        function (a, b) { var n = arguments.length; return n === 1 ? call1(orig, this, a) : n === 2 ? call2(orig, this, a, b) : operation(orig, this, arguments); } :
        typeof call2 === "function" ? function (a, b) { return arguments.length === 2 ? call2(orig, this, a, b) : operation(orig, this, arguments); } :
        typeof call1 === "function" ? function (a) { return arguments.length === 1 ? call1(orig, this, a) : operation(orig, this, arguments); } :
        function () { return operation(orig, this, arguments); };
    copyStatics(patched, orig);
    return replaceValue(exports, key, patched);
}
// ---- new hookExport: a call3 hook gets the same treatment
function hookNew(exports, key, operation) {
    var orig = exports[key], call3 = operation.call3, call2 = operation.call2, call1 = operation.call1;
    var patched = typeof call3 === "function" ?
        function (a, b, c) { return arguments.length === 3 ? call3(orig, this, a, b, c) : operation(orig, this, arguments); } :
        function () { return operation(orig, this, arguments); };
    copyStatics(patched, orig);
    return replaceValue(exports, key, patched);
}
var FULL_IMAGE_URL = /^(https:\/\/(?:cdn\.discordapp\.com|media\.discordapp\.net))(\/attachments\/[^?#\s]+)(?:\?([^#\s]*))?$/;
function fullImageUrl(src) { return null; }
// ---- old fullImagesSrc
function srcOld(orig, self, args) {
    if (enabled("fullImages") && settings.fullImagesChat) { try { var url = fullImageUrl(args[0], args[1], args[2]); if (url) return url; } catch (_) {} }
    return orig.apply(self, args);
}
// ---- new fullImagesSrc
function srcNew(orig, self, args) { return srcNew.call3(orig, self, args[0], args[1], args[2]); }
srcNew.call3 = function (orig, self, src, w, h) {
    if (enabled("fullImages") && settings.fullImagesChat) { try { var url = fullImageUrl(src, w, h); if (url) return url; } catch (_) {} }
    return orig.call(self, src, w, h);
};
// ---- avatar hook: old (apply first) vs new
function avOld(banner) {
    return function (orig, self, args) {
        var out = orig.apply(self, args);
        if (!settings.fullImagesAvatars || !enabled("fullImages")) return out;
        return out;
    };
}
function avNew(banner) {
    var operation = function (orig, self, args) { return orig.apply(self, args); };
    operation.call3 = function (orig, self, a, b, c) {
        var out = orig.call(self, a, b, c);
        if (!settings.fullImagesAvatars || !enabled("fullImages")) return out;
        return out;
    };
    return operation;
}
function mk() { return {getMobileOptimizedSrc: function (s, w, h) { return s; }, getUserAvatarURL: function (u, a, s) { return u; }}; }
var oS = hookOld(mk(), "getMobileOptimizedSrc", srcOld), nS = hookNew(mk(), "getMobileOptimizedSrc", srcNew);
var oA = hookOld(mk(), "getUserAvatarURL", avOld(false)), nA = hookNew(mk(), "getUserAvatarURL", avNew(false));
var url = "https://cdn.discordapp.com/attachments/1/2/a.png?ex=1&is=2&hm=3";
var sink = 0;
function loopS(o) { return function () { for (var i = 0; i < 100; i++) if (o.getMobileOptimizedSrc(url, 400, 300)) sink++; }; }
function loopA(o) { return function () { for (var i = 0; i < 100; i++) if (o.getUserAvatarURL(url, true, 128)) sink++; }; }
bench("old getMobileOptimizedSrc x100, off", loopS(oS));
bench("new getMobileOptimizedSrc x100, off", loopS(nS));
bench("old avatar URL x100, off", loopA(oA));
bench("new avatar URL x100, off", loopA(nA));
