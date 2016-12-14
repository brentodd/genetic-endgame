
function Mob(){
    this.x = 0;
    this.y = 0;
    this.transform_x = 0;
    this.transform_y = 0;
    this.draw = function(){
        this.g = AHQ.canvas.rect((this.x * AHQ.options.scale)+1,
                                 (this.y * AHQ.options.scale)+1, 
                                 AHQ.options.scale-2, 
                                 AHQ.options.scale-2).attr({fill: "#0F0"})
        if (AHQ.the_o_g == null){
            AHQ.the_o_g = this.g
        }
        else{
            AHQ.the_o_g.add(this.g)
        }
    }
    this.move = function(x,y){
        this.transform_x += x;
        this.transform_y += y;
        target_x = this.x+x;
        target_y = this.y+y;
        AHQ.gt.x += x; AHQ.gt.y += y;
        
        if(AHQ.the_map.can_move_to(this, target_x, target_y)){
            stack = AHQ.the_map.get(target_x, target_y)
            for(i=0; i<stack.length; i++){
                try{
                    stack[i].visit();
                }
                catch(ex){
                    console.error(ex)
                    console.error("on_tile is " + on_tile)
                    console.error("If we're on a placeholder, no biggie - shouldn't be here anyway")
                }
            }
            this.x = target_x;
            this.y = target_y;
            this.g.animate({transform:'t'+this.transform_x*AHQ.options.scale+','+this.transform_y*AHQ.options.scale}, 75);
            //AHQ.the_o_g.animate({transform:'translate('+(this.transform_x*AHQ.options.scale)*-1+','+(this.transform_y*AHQ.options.scale)*-1+')'}, 100)//, mina.easeout)
            AHQ.canvas.append(this.g)
        } else {
            this.transform_x -= x;
            this.transform_y -= y;
            AHQ.gt.x -= x; AHQ.gt.y -= y;
        }

    }
}
AHQ.Mob = Mob;
