var DLOG_HIDDEN = /token|authori[sz]ation|password|secret|cookie|session|fingerprint|email|phone|ticket|nonce|captcha|mfa|^content$|^message$/i;
function oldReplacer(key, value) {
    if (key && DLOG_HIDDEN.test(key)) return "[hidden]";
    return typeof value === "string" && value.length > 300 ? value.slice(0, 300) + "..." : value;
}
var hiddenKeys = Object.create(null), hiddenCount = 0;
function newReplacer(key, value) {
    if (key) {
        var hidden = hiddenKeys[key];
        if (hidden === undefined) {
            hidden = DLOG_HIDDEN.test(key);
            if (hiddenCount < 2000) { hiddenKeys[key] = hidden; hiddenCount++; }
        }
        if (hidden) return "[hidden]";
    }
    return typeof value === "string" && value.length > 300 ? value.slice(0, 300) + "..." : value;
}
var sample = {
    channel_id: "123456789012345678", guild_id: "123456789012345679", type: 0, flags: 0, nsfw: false, position: 3, name: "general",
    permission_overwrites: [{id: "1", type: 0, allow: "1024", deny: "0"}, {id: "2", type: 1, allow: "0", deny: "2048"}],
    members: [{user: {id: "1", username: "a", discriminator: "0", avatar: "x", bot: false}, roles: ["1", "2"], nick: null, joined_at: "2020", premium_since: null, deaf: false, mute: false}],
    recipients: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], state: "ready", session_id: "abc", token: "secret"
};
function run(rep) { return JSON.stringify(sample, rep).length; }
if (run(oldReplacer) !== run(newReplacer)) throw new Error("mismatch");
bench("old dlogReplacer stringify", function () { return run(oldReplacer); });
bench("new dlogReplacer stringify", function () { return run(newReplacer); });
