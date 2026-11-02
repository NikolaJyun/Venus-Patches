// getStickerSendability(sticker, user, channel) / isSendableSticker(sticker, user, channel): once per sticker in the picker, Stickers off.
var settings = {stickers: false}, features = {stickers: true};
function enabled(key) { return !!settings[key] && !!features[key]; }
function copyStatics() {}
function replaceValue(o, k, v) { o[k] = v; return o; }
var stickerRules = {StickerSendability: {SENDABLE: 0, SENDABLE_WITH_PREMIUM: 1}};
function stickerLink() { return null; }
function hookExport(exports, key, operation) {
    var orig = exports[key], call3 = operation.call3;
    var patched = typeof call3 === "function" ? function (a, b, c) { return arguments.length === 3 ? call3(orig, this, a, b, c) : operation(orig, this, arguments); } :
        function () { return operation(orig, this, arguments); };
    copyStatics(patched, orig);
    return replaceValue(exports, key, patched);
}
function sendOld(orig, self, args) {
    var result = orig.apply(self, args), sticker = args[0];
    return enabled("stickers") && stickerRules && result === stickerRules.StickerSendability.SENDABLE_WITH_PREMIUM && stickerLink(sticker) ? stickerRules.StickerSendability.SENDABLE : result;
}
function okOld(orig, self, args) {
    var result = orig.apply(self, args);
    if (result || !enabled("stickers") || !stickerRules) return result;
    var code = stickerRules.getStickerSendability.apply(stickerRules, args);
    return code === stickerRules.StickerSendability.SENDABLE;
}
function sendFinish(result, sticker) {
    return enabled("stickers") && stickerRules && result === stickerRules.StickerSendability.SENDABLE_WITH_PREMIUM && stickerLink(sticker) ? stickerRules.StickerSendability.SENDABLE : result;
}
function sendNew(orig, self, args) { return sendFinish(orig.apply(self, args), args[0]); }
sendNew.call3 = function (orig, self, sticker, user, channel) { return sendFinish(orig.call(self, sticker, user, channel), sticker); };
function okNew(orig, self, args) {
    var result = orig.apply(self, args);
    if (result || !enabled("stickers") || !stickerRules) return result;
    return stickerRules.getStickerSendability.apply(stickerRules, args) === stickerRules.StickerSendability.SENDABLE;
}
okNew.call3 = function (orig, self, sticker, user, channel) {
    var result = orig.call(self, sticker, user, channel);
    if (result || !enabled("stickers") || !stickerRules) return result;
    return stickerRules.getStickerSendability(sticker, user, channel) === stickerRules.StickerSendability.SENDABLE;
};
function mk() { return {getStickerSendability: function (s, u, c) { return 1; }, isSendableSticker: function (s, u, c) { return true; }}; }
stickerRules.getStickerSendability = function (s, u, c) { return 1; };
var o = mk(), n = mk();
o = hookExport(o, "getStickerSendability", sendOld); o = hookExport(o, "isSendableSticker", okOld);
n = hookExport(n, "getStickerSendability", sendNew); n = hookExport(n, "isSendableSticker", okNew);
var st = {id: "1"}, us = {id: "2"}, ch = {id: "3"}, sink = 0;
bench("old sendability+sendable x100", function () { for (var i = 0; i < 100; i++) { if (o.getStickerSendability(st, us, ch)) sink++; if (o.isSendableSticker(st, us, ch)) sink++; } });
bench("new sendability+sendable x100", function () { for (var i = 0; i < 100; i++) { if (n.getStickerSendability(st, us, ch)) sink++; if (n.isSendableSticker(st, us, ch)) sink++; } });
