import Vec from "./vec.js";
let buf;
export function initTools(display) {
    buf = display.buf;
    // for console access
    Object.assign(window, { lerp, lerpv, shortestAngle, lerpRot, rotate, screenPointToWorldPoint, fillCircle, strokeCircle, fillRect, strokeRect, line });
}
export function lerp(n1, n2, t) {
    return (1 - t) * n1 + n2 * t;
}
export function lerpv(v1, v2, t) {
    return v1.mlts(1 - t).add(v2.mlts(t));
}
// see https://stackoverflow.com/a/14498790
export function shortestAngle(n1, n2) {
    return ((((n2 - n1) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
}
export function lerpRot(n1, n2, t) {
    n2 = n1 + shortestAngle(n1, n2);
    return lerp(n1, n2, t);
}
export function rotate(v, deg) {
    let sin = Math.sin(deg), cos = Math.cos(deg);
    return new Vec(v.x * cos - v.y * sin, v.y * cos + v.x * sin);
}
// copilot generated, might replace with distance comparison
export function pointInLineSeg(p, a, b) {
    let d = b.sub(a);
    let t = d.dot(p.sub(a)) / d.magSq;
    return t >= 0 && t <= 1;
}
export function screenPointToWorldPoint(display, v) {
    // translate by element offset and scale by ratio of buffer size to canvas size
    return new Vec(((v.x - display.can.offsetLeft) * display.width) / display.can.offsetWidth, ((v.y - display.can.offsetTop) * display.height) / display.can.offsetHeight);
}
export function fillCircle(pos, radius, color = "white") {
    buf.save();
    buf.beginPath();
    buf.fillStyle = color;
    buf.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
    buf.fill();
    buf.restore();
}
export function strokeCircle(pos, radius, thickness = 2, color = "white") {
    buf.save();
    buf.beginPath();
    buf.lineWidth = thickness;
    buf.strokeStyle = color;
    buf.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
    buf.stroke();
    buf.restore();
}
export function fillRect(pos, size, color = "white", offset = new Vec()) {
    pos = pos.sub(offset);
    buf.save();
    buf.beginPath();
    buf.fillStyle = color;
    buf.fillRect(pos.x, pos.y, size.x, size.y);
    buf.restore();
}
export function strokeRect(pos, size, thickness = 2, color = "white", offset = new Vec()) {
    pos = pos.sub(offset);
    buf.save();
    buf.beginPath();
    buf.lineWidth = thickness;
    buf.strokeStyle = color;
    buf.strokeRect(pos.x, pos.y, size.x, size.y);
    buf.restore();
}
export function line(s, e, width = 10, color = "white") {
    buf.save();
    buf.beginPath();
    buf.strokeStyle = color;
    buf.lineWidth = width;
    buf.moveTo(s.x, s.y);
    buf.lineTo(e.x, e.y);
    buf.stroke();
    buf.restore();
}
export function constrain(value, lower, upper) {
    return Math.max(lower, Math.min(value, upper));
}
