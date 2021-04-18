// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!╭────────────────────────────────────────────────────────────╮!!!!!!!
// !!!!!!!│                                                            │!!!!!!!
// !!!!!!!│   ╭─────╮ ╭╮     ╭─────╮╭─────╮╭─────╮       ╭─╮ ╭─────╮   │!!!!!!!
// !!!!!!!│   │╭──╮ │ ││     │╭───╮││╭──╮ ││     │       ╰─╯ │╭──╮ │   │!!!!!!!
// !!!!!!!│   ││  ╰─╯ ││     ││   ││││  ╰─╯╰─╮ ╭─╯       ╭─╮ ││  ╰─╯   │!!!!!!!
// !!!!!!!│   ││      ││     ││   ││││       │ │         │ │ ││        │!!!!!!!
// !!!!!!!│   ││  ╭─╮ │╰────╮││   │││╰────╮  │ │         │ │ │╰────╮   │!!!!!!!
// !!!!!!!│   ││  ╰╮│ │╭───╮│││   ││╰────╮│  │ │         │ │ ╰────╮│   │!!!!!!!
// !!!!!!!│   ││   ││ ││   ││││   ││     ││  │ │         │ │      ││   │!!!!!!!
// !!!!!!!│   ││   ││ ││   ││││   ││╭─╮  ││  │ │         │ │ ╭─╮  ││   │!!!!!!!
// !!!!!!!│   │╰───╯│ ││   │││╰───╯││ ╰──╯│  │ │  ╭─╮╭───╯ │ │ ╰──╯│   │!!!!!!!
// !!!!!!!│   ╰─────╯ ╰╯   ╰╯╰─────╯╰─────╯  ╰─╯  ╰─╯╰─────╯ ╰─────╯   │!!!!!!!
// !!!!!!!│           ╭───────────────────────────────────╮            │!!!!!!!
// !!!!!!!│           │             Ghost.JS              │            │!!!!!!!
// !!!!!!!│           │–—–—–—–—–—–—–—–—–—–—–—–—–—–—–—–—–—–│            │!!!!!!!
// !!!!!!!│           │    Animate or Ghost an element    │            │!!!!!!!
// !!!!!!!│           │   to another element's position   │            │!!!!!!!
// !!!!!!!│           │–—–—–—–—–—–—–—–—–—–—–—–—–—–—–—–—–—–│            │!!!!!!!
// !!!!!!!│           │        github.com/vixalien        │            │!!!!!!!
// !!!!!!!│           │–—–—–—–—–—–—–—–—–—–—–—–—–—–—–—–—–—–│            │!!!!!!!
// !!!!!!!│           │         © vixalien   2020         │            │!!!!!!!
// !!!!!!!│           ╰───────────────────────────────────╯            │!!!!!!!
// !!!!!!!│                                                            │!!!!!!!
// !!!!!!!╰────────────────────────────────────────────────────────────╯!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!    Contributors Needed!    !!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Ghost, or animate an element from it's loc to another's location
function Ghost(from, to, time, fps) {
    if (time === void 0) { time = 100; }
    if (fps === void 0) { fps = 25; }
    // from: An element you want to move
    // to: An element the from element will cover
    // time: the time in microseconds the transition will endure
    // fbs: the number of animations per time, (as frames per seconds)
    var from_box = from.getBoundingClientRect();
    var to_box = to.getBoundingClientRect();
    var times = {};
    var frame_time = time / fps;
    from.style.position = "relative";
    for (var attr in from_box) {
        if (typeof from_box[attr] == "number") {
            times[attr] = (to_box[attr] - from_box[attr]) / fps;
            if (["left", "top", "right", "bottom"].includes(attr)) {
                from.style[attr] = 0;
            }
            else if (["width", "height"].includes(attr)) {
                if (attr == "width") {
                    var pl = from.computedStyleMap().get("padding-left").to("px").value;
                    var pr = from.computedStyleMap().get("padding-right").to("px").value;
                    var bl = from.computedStyleMap().get("border-left-width").to("px").value;
                    var br = from.computedStyleMap().get("border-right-width").to("px").value;
                    from.style[attr] = from_box[attr] - (pl + pr + bl + br);
                }
                else if (attr == "height") {
                    var pt = from.computedStyleMap().get("padding-top").to("px").value;
                    var pb = from.computedStyleMap().get("padding-bottom").to("px").value;
                    var bt = from.computedStyleMap().get("border-top-width").to("px").value;
                    var bb = from.computedStyleMap().get("border-bottom-width").to("px").value;
                    from.style[attr] = from_box[attr] - (pt + pb + bt + bb);
                }
            }
        }
    }
    var frames = 0;
    var a = setInterval(function () { upframe(a); }, frame_time);
    function upframe(a) {
        if (frames == fps) {
            clearInterval(a);
            console.log({ frames: frames, from: from, to: to, from_box: from_box, to_box: to_box, fps: fps, time: time, times: times });
        }
        else {
            frames++;
            for (var attr in times) {
                // console.log("for the ",frames,"'s time, ",attr,"was",from.style[attr]);
                var num = pxtonum(from.style[attr]);
                var newnum = num + times[attr];
                from.style[attr] = newnum + "px";
                // console.log("adding",times[attr],"is",from.style[attr]);
            }
        }
    }
}
function pxtonum(px) {
    return parseFloat(px.split("px")[0]);
}
