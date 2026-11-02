var table = {VINpSK: [{value: "Invite"}], HcoRu0: [{value: "Notifications"}], Uj0md3: [{value: "Boost"}]};
var intl = {string: function (msg) { var out = ""; for (var j = 0; j < msg.length; j++) out += msg[j].value; return out; }};
var IconButton = function () {}, BoostGemIcon = function () {};
var mods = {1128: {t: table, intl: intl}, 7840: {IconButton: IconButton}, 9709: {BoostGemIcon: BoostGemIcon}};
var settings = {debugLog: false};
var global = {__r: function (id) { return mods[id]; }};
function inspectedExport(id, key) {
    if (typeof global.__r !== "function") return null;
    try { var exports = global.__r(id), value = exports && exports[key]; return value; } catch (e) { return null; }
}
function discordText(hash) {
    try { var m = global.__r(1128), msg = m && m.t && m.t[hash]; return msg != null && m.intl ? String(m.intl.string(msg) || "") : ""; } catch (_) { return ""; }
}
function oldSpot(node) {
    if (node.type !== inspectedExport(7840, "IconButton")) return null;
    var icon = node.props.icon, label = node.props.label;
    if (icon && typeof icon === "object" && icon.type && icon.type === inspectedExport(9709, "BoostGemIcon")) return "guild.boost";
    if (typeof label !== "string" || !label) return null;
    return label === discordText("VINpSK") ? "guild.invite" : label === discordText("HcoRu0") ? "guild.notifications" : label === discordText("Uj0md3") ? "guild.boost" : null;
}
var tabLabels = null;
function newSpot(node) {
    if (node.type !== inspectedExport(7840, "IconButton")) return null;
    var icon = node.props.icon, label = node.props.label;
    if (icon && typeof icon === "object" && icon.type && icon.type === inspectedExport(9709, "BoostGemIcon")) return "guild.boost";
    if (typeof label !== "string" || !label) return null;
    var probe = discordText("VINpSK");
    if (!tabLabels || tabLabels.probe !== probe) {
        var map = new Map();
        var entries = [["VINpSK", "guild.invite"], ["HcoRu0", "guild.notifications"], ["Uj0md3", "guild.boost"]];
        for (var i = 0; i < entries.length; i++) { var text = discordText(entries[i][0]); if (text && !map.has(text)) map.set(text, entries[i][1]); }
        tabLabels = {probe: probe, map: map};
    }
    return tabLabels.map.get(label) || null;
}
var nodes = [
  {type: IconButton, props: {label: "Invite", icon: {type: function () {}}}},
  {type: IconButton, props: {label: "Notifications", icon: {type: function () {}}}},
  {type: IconButton, props: {label: "12 Boosts", icon: {type: function () {}}}},
  {type: IconButton, props: {label: "Boost", icon: {type: BoostGemIcon}}},
  {type: IconButton, props: {label: "Something else", icon: null}},
  {type: function () {}, props: {}}
];
for (var i = 0; i < nodes.length; i++) if (oldSpot(nodes[i]) !== newSpot(nodes[i])) throw new Error("mismatch " + i);
function all(f) { var n = 0; for (var i = 0; i < nodes.length; i++) if (f(nodes[i])) n++; return n; }
bench("old guildTabSpot x6", function () { return all(oldSpot); });
bench("new guildTabSpot x6", function () { return all(newSpot); });
