// Mod with extended long tap
export class TouchEventManager {
	ontouch = null;
	onlongtouch = null;
	ontouchdown = null;
	ontouchup = null;
	ontouchmove = null;

	constructor(widget) {
		this._init(widget);
	}

	_init(widget) {
		let handleClick = true;
		let timerLongTap = -1;

		widget.addEventListener(hmUI.event.CLICK_UP, (e) => {
			if(this.ontouchup) this.ontouchup(e);
			if(handleClick && this.ontouch) this.ontouch(e);

			handleClick = false;
			timer.stopTimer(timerLongTap);
		});

		widget.addEventListener(hmUI.event.CLICK_DOWN, (e) => {
			if(this.ontouchdown) this.ontouchdown(e);

			handleClick = true;
			timerLongTap = timer.createTimer(1500, 0, () => {
				if(handleClick && this.onlongtouch) {
					this.onlongtouch(e);
					handleClick = false;
				}
			})
		});

		widget.addEventListener(hmUI.event.MOVE, (e) => {
			if(this.ontouchmove) this.ontouchmove(e);
			
			handleClick = false;
			timer.stopTimer(timerLongTap);
		})
	}
}