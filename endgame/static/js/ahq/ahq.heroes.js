(function(){
	function Hero(){
	    AHQ.Mob.call(this)
	    this.x = AHQ.options.start_x;
	    this.y = AHQ.options.start_y;
	}
	Hero.prototype = Object.create(AHQ.Mob.prototype);
	Hero.prototype.constructor = Hero;
	AHQ.Hero = Hero;
})(AHQ || {})