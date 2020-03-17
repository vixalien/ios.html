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
// !!!!!!!│           │ An Efficient Way to Move or Ghost │            │!!!!!!!
// !!!!!!!│           │  elements to another's location   │            │!!!!!!!
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

function Ghost(from, to, time = 100, fps = 25) {
	var from_box = from.getBoundingClientRect();
	var to_box = to.getBoundingClientRect();
	var times = {};
	var frame_time = time / fps;
	from.style.position = "relative";
	for(var attr in from_box) {
		if(typeof from_box[attr] == "number") {
			times[attr] = (to_box[attr] - from_box[attr])/fps;
			if(["left","top","right","bottom"].includes(attr)) {
				from.style[attr] = 0;
			} else if (["width","height"].includes(attr)) {
				if (attr == "width") {
					var pl = from.computedStyleMap().get("padding-left").to("px").value;
					var pr = from.computedStyleMap().get("padding-right").to("px").value;
					var bl = from.computedStyleMap().get("border-left-width").to("px").value;
					var br = from.computedStyleMap().get("border-right-width").to("px").value;
					from.style[attr] = from_box[attr] - (pl + pr + bl + br);
				} else if (attr == "height") {
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
	var a = setInterval(function() { upframe(a) }, frame_time);
	function upframe(a) {
		if(frames == fps) {
			clearInterval(a);
			from.style.backgroundColor = "white";
			console.log({frames, from, to, from_box, to_box, fps, time, times});
		} else {
			frames++;
			for(var attr in times) {
				// console.log("for the ",frames,"'s time, ",attr,"was",from.style[attr]);
				var num = pxtonum(from.style[attr]);
				var newnum = num+times[attr];
				from.style[attr]=newnum+"px";
				// console.log("adding",times[attr],"is",from.style[attr]);
			}
		}
	}
}
function pxtonum(px) {
	return parseFloat(px.split("px")[0]);
}