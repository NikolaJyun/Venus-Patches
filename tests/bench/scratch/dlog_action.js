var DLOG_HIDDEN = /token|authori[sz]ation|password|secret|cookie|session|fingerprint|email|phone|ticket|nonce|captcha|mfa|^content$|^message$/i;
var DLOG_ACTION_VALUES = new Set(["section", "subsection", "state", "status", "theme", "systemTheme", "reason", "source", "context", "location"]);
function oldAction(action) {
    var bits = [action.type], rest = [];
    var keys = Object.keys(action);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key === "type") continue;
        var value = action[key];
        if (bits.length < 9 && !DLOG_HIDDEN.test(key) && (typeof value === "string" && /Id$/.test(key) && /^\d{15,21}$/.test(value) ||
            DLOG_ACTION_VALUES.has(key) && (typeof value === "boolean" || typeof value === "number" || typeof value === "string" && value.length <= 40)))
            bits.push(key + "=" + value);
        else rest.push(key + (Array.isArray(value) ? "[" + value.length + "]" : ""));
    }
    if (rest.length) bits.push("{" + rest.slice(0, 12).join(",") + (rest.length > 12 ? ",+" + (rest.length - 12) : "") + "}");
    return bits.join(" ");
}
// New: the cheap, selective test first (string value + the Id suffix / known key), the key-name regex only for the keys that would be printed.
function newAction(action) {
    var bits = [action.type], rest = [];
    var keys = Object.keys(action);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key === "type") continue;
        var value = action[key], t = typeof value, show = false;
        if (bits.length < 9) {
            if (t === "string") show = key.length > 2 && key.charCodeAt(key.length - 2) === 73 && key.charCodeAt(key.length - 1) === 100 ? /^\d{15,21}$/.test(value) || DLOG_ACTION_VALUES.has(key) && value.length <= 40 : DLOG_ACTION_VALUES.has(key) && value.length <= 40;
            else if (t === "boolean" || t === "number") show = DLOG_ACTION_VALUES.has(key);
            if (show && DLOG_HIDDEN.test(key)) show = false;
        }
        if (show) bits.push(key + "=" + value);
        else rest.push(Array.isArray(value) ? key + "[" + value.length + "]" : key);
    }
    if (rest.length) bits.push("{" + rest.slice(0, 12).join(",") + (rest.length > 12 ? ",+" + (rest.length - 12) : "") + "}");
    return bits.join(" ");
}
var actions = [
  {type:"MESSAGE_CREATE", channelId:"123456789012345678", guildId:"123456789012345679", message:{id:"1"}, optimistic:false, isPushNotification:false},
  {type:"TYPING_START", channelId:"123456789012345678", userId:"123456789012345670", timestamp:1234},
  {type:"CHANNEL_SELECT", guildId:"123456789012345679", channelId:"123456789012345678", messageId:null, jumpType:"ANIMATED"},
  {type:"PRESENCE_UPDATES", updates:[{},{},{}], state:"x"},
  {type:"LOAD_MESSAGES_SUCCESS", channelId:"123456789012345678", messages:[1,2,3], isBefore:false, isAfter:false, hasMoreBefore:true, hasMoreAfter:false, jump:null, isStale:false, truncate:false, extra:1},
  {type:"GUILD_MEMBER_UPDATE", guildId:"123456789012345679", user:{}, roles:[1,2], nick:"x", premiumSince:null, avatar:null, communicationDisabledUntil:null, flags:0}
];
function runAll(f) { var s = 0; for (var i = 0; i < actions.length; i++) s += f(actions[i]).length; return s; }
for (var i = 0; i < actions.length; i++) if (oldAction(actions[i]) !== newAction(actions[i])) throw new Error("mismatch " + oldAction(actions[i]) + " | " + newAction(actions[i]));
bench("old dlogAction x6", function () { return runAll(oldAction); });
bench("new dlogAction x6", function () { return runAll(newAction); });
