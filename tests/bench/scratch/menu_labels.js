// Stand-in for Discord's intl (module 1128): a message table plus a string() that formats. Real intl does more work per call
// (ICU-style parsing), so this is a floor for the saving, not an exaggeration.
var table = {};
var hashes = ["GISTta","DisZzB","BGYkaH","8pOYUE","Sd8Ixw","bHa9kN","ygslb0","y5MwJy","WqhZss","/AXYnE","QvQeLv","PHjkRE","xNdRDO","n5zMI+","ytCpKs","8wXU9B","l4Emac","XyHpKH","wqHXNt","TbHyMG","jhJzez"];
for (var i = 0; i < hashes.length; i++) table[hashes[i]] = [{type: 0, value: "Label " + i}];
var intl = {string: function (msg) { var out = ""; for (var j = 0; j < msg.length; j++) out += msg[j].value; return out; }};
var global = {__r: function () { return {t: table, intl: intl}; }};
function discordText(hash) {
    try { var m = global.__r(1128), msg = m && m.t && m.t[hash]; return msg != null && m.intl ? String(m.intl.string(msg) || "") : ""; } catch (_) { return ""; }
}
var MENU_SPOTS = {"menu.mainProfile":["GISTta"], "menu.serverProfile":["DisZzB"], "menu.nickname":["BGYkaH", "8pOYUE"], "menu.invite":["Sd8Ixw"],
    "menu.ring":["bHa9kN", "ygslb0"], "menu.copyUsername":["y5MwJy"], "menu.copyLink":["WqhZss"], "menu.copyId":["/AXYnE"], "menu.copyInfo":["QvQeLv"],
    "menu.apps":["PHjkRE"], "menu.shopLook":["xNdRDO"], "menu.removeFromGroup":["n5zMI+"], "menu.ignore":["ytCpKs", "8wXU9B"],
    "menu.block":["l4Emac", "XyHpKH"], "menu.report":["wqHXNt", "TbHyMG", "jhJzez"]};
function oldLabels() {
    var labels = new Map();
    Object.keys(MENU_SPOTS).forEach(function (key) { MENU_SPOTS[key].forEach(function (hash) { var text = discordText(hash); if (text) labels.set(text, key); }); });
    return labels;
}
var menuLabels = null;
function newLabels() {
    var probe = discordText("GISTta");
    if (menuLabels && menuLabels.probe === probe) return menuLabels.map;
    var map = oldLabels();
    menuLabels = {probe: probe, map: map};
    return map;
}
var a = oldLabels(), b = newLabels();
if (a.size !== b.size) throw new Error("size mismatch");
a.forEach(function (v, k) { if (b.get(k) !== v) throw new Error("mismatch " + k); });
bench("old profileMenu labels", function () { return oldLabels().size; });
bench("new profileMenu labels", function () { return newLabels().size; });
