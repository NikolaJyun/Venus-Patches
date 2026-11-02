function oldStamp(ms) {
    var d = new Date(ms), pad = function (n, w) { var t = String(n); while (t.length < w) t = "0" + t; return t; };
    return pad(d.getHours(), 2) + ":" + pad(d.getMinutes(), 2) + ":" + pad(d.getSeconds(), 2) + "." + pad(d.getMilliseconds(), 3);
}
var TWO = []; for (var i = 0; i < 60; i++) TWO.push(i < 10 ? "0" + i : "" + i);
var stampSecond = -1, stampPrefix = "";
function newStamp(ms) {
    var second = Math.floor(ms / 1000), milli = ms - second * 1000;
    if (second !== stampSecond) {
        var d = new Date(ms);
        stampSecond = second;
        stampPrefix = TWO[d.getHours()] + ":" + TWO[d.getMinutes()] + ":" + TWO[d.getSeconds()] + ".";
    }
    return stampPrefix + (milli < 10 ? "00" : milli < 100 ? "0" : "") + milli;
}
// Equivalence: every ms over a day crossing, negative/odd inputs excluded (Date.now() only).
var base = 1700000000000 + 123, bad = 0;
for (var j = 0; j < 400000; j++) { var t = base + j * 37; if (oldStamp(t) !== newStamp(t)) { bad++; } }
if (bad) throw new Error("stamp mismatch " + bad);
var t0 = 1700000000000;
var k = 0;
// Realistic: a burst of lines inside the same second (several per ms-step), then the clock moves on.
bench("old dlogStamp", function () { k += 7; return oldStamp(t0 + k); });
bench("new dlogStamp", function () { k += 7; return newStamp(t0 + k); });
