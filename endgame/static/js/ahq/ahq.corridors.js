function Corridor(parent_obj, relation, psg_length){
    /* A Corridor is a DungeonTile which begins and ends with a Junction.
    It can vary in length between 5, 10, or 15 squares. 
    It can have up to 2 Doors along its length (or more, but only 2 from
    the construction), or Wandering Monsters.
    Doors from a Corridor ALWAYS lead to a Room.
      .draw(): will render itself and child Junctions and Doors
      .visit(): does nothing.
    */
    AHQ.DungeonTile.call(this, parent_obj, relation);
    if(this.parent.constructor.name == 'Junction'){
        this.beginning = this.parent;
        switch(this.of_parent.toLowerCase()){
        case 'n':
            this.width = 2;
            this.height = psg_length || AHQ.choose(AHQ.table_passage_length);
            while(this.height>0){
                this.x = this.parent.x;
                test_y = this.parent.y-this.height-2; // -2 for the inevitable junction
                if(AHQ.test_placement(this.x, test_y, this.width, this.height+2) != null){
                    this.height = this.height - 5;
                } else {
                    this.y = this.parent.y-this.height;
                    break
                }
            }
            if(this.height>0){
                this.end = new AHQ.Junction(this, 'n')
                if(this.parent.north != null){
                    // we need to remove the existing north the Junction
                    this.parent.north.remove();
                }
                this.parent.north = this;
            }
            break;
        case 's':
            this.width = 2;
            this.height = psg_length || AHQ.choose(AHQ.table_passage_length);
            while(this.height>0){
                this.x = this.parent.x;
                this.y = this.parent.y+2;
                if(AHQ.test_placement(this.x, this.y, this.width, this.height+2) != null){
                    this.height = this.height - 5;
                } else {
                    break
                }
            }
            if(this.height>0){
                this.end = new AHQ.Junction(this, 's')
                if(this.parent.south != null){
                    // we need to remove the existing south the Junction
                    this.parent.south.remove();
                }
                this.parent.south = this;
            }
            break;
        case 'e':
            this.width = psg_length || AHQ.choose(AHQ.table_passage_length);
            this.height = 2;
            while(this.width > 0){
                this.x = this.parent.x+2;
                this.y = this.parent.y;
                if(AHQ.test_placement(this.x, this.y, this.width+2, this.height) != null){
                    this.width = this.width - 5;
                } else {
                    break
                }
            }
            if(this.width > 0){
                this.end = new AHQ.Junction(this, 'e')
                if(this.parent.east != null){
                    // we need to remove the existing east the Junction
                    this.parent.east.remove();
                }
                this.parent.east = this;
            }
            break;
        case 'w':
            this.width = psg_length || AHQ.choose(AHQ.table_passage_length);
            this.height = 2;
            while(this.width > 0){
                test_x = this.parent.x-this.width-2;  // -2 for the junction
                this.y = this.parent.y;
                if(AHQ.test_placement(test_x, this.y, this.width+2, this.height) != null){
                    this.width = this.width - 5;
                } else {
                    this.x = this.parent.x-this.width;
                    break
                }
            }
            if(this.width > 0){
                this.end = new AHQ.Junction(this, 'w')
                if(this.parent.west != null){
                    // we need to remove the existing west the Junction
                    this.parent.west.remove();
                }
                this.parent.west = this;
            }
            break;
        }
    } else {
        console.error("Haven't Implemented non-Junction ("+this.parent.constructor.name+") Parents for Corridors yet!")
    }
    
    if(this.width != 0 && this.height != 0){
        this.passage_feature = AHQ.get_passage_feature();
        this.doors = [];
        if(this.passage_feature == '1 Door'){
            d = new AHQ.Door(this);
            if(d.chosen_loc != null){
                this.doors.push(d);
                d.draw();
            }
        } else if (this.passage_feature == '2 Doors'){
            for(door_placement_iterator=0; door_placement_iterator < 2; door_placement_iterator++){
                d = new AHQ.Door(this);
                if(d.chosen_loc != null){
                    this.doors.push(d);
                    d.draw();
                }
            }
        }
    }
    this.draw = function(){
        if(this.drawn){
            return
        }
        x_scaled = this.x*AHQ.options.scale;
        y_scaled = this.y*AHQ.options.scale;
        width_scaled = this.width*AHQ.options.scale;
        height_scaled = this.height*AHQ.options.scale;

        if(this.passage_feature == 'Wandering Monsters!'){
            bg = AHQ.canvas.rect(x_scaled, y_scaled, width_scaled, height_scaled).attr({fill: AHQ.pattern.grey()});
        } else {
            bg = AHQ.canvas.rect(x_scaled, y_scaled, width_scaled, height_scaled).attr({fill: AHQ.pattern.brown()});
        }
        wall_nudge = AHQ.options.walls.strokeWidth/2
        grid = AHQ.canvas.rect(x_scaled, y_scaled, width_scaled, height_scaled).attr({fill: AHQ.grid_pattern()});
        wall_east = "M"+(x_scaled+width_scaled-wall_nudge)+","+y_scaled+"L"+(x_scaled+width_scaled-wall_nudge)+","+(y_scaled+height_scaled);
        wall_west = "M"+(x_scaled+wall_nudge)+","+y_scaled+"L"+(x_scaled+wall_nudge)+","+(y_scaled+height_scaled);
        wall_south = "M"+x_scaled+","+(y_scaled+height_scaled-wall_nudge)+"L"+(x_scaled+width_scaled)+","+(y_scaled+height_scaled-wall_nudge)
        wall_north = "M"+x_scaled+","+(y_scaled+wall_nudge)+"L"+(x_scaled+width_scaled)+","+(y_scaled+wall_nudge)
        this.g = AHQ.canvas.g(bg,grid);
        if (AHQ.the_o_g == null){
            AHQ.the_o_g = this.g
        }
        else{
            AHQ.the_o_g.add(this.g)
        }
        if(this.of_parent == 'n' || this.of_parent == 's'){
            this.g.add(AHQ.canvas.path(wall_east).attr(AHQ.options.walls));
            this.g.add(AHQ.canvas.path(wall_west).attr(AHQ.options.walls));
        } else {
            this.g.add(AHQ.canvas.path(wall_north).attr(AHQ.options.walls));
            this.g.add(AHQ.canvas.path(wall_south).attr(AHQ.options.walls));
        }
        if(this.passage_feature == 'Wandering Monsters!'){
            AHQ.annotate(this, "RAWR!")
        }
        AHQ.registry_tiles[this.g.id] = this;
        if(!this.beginning.drawn){
            this.beginning.draw();
        }
        if(!this.end.drawn){
            this.end.draw();
        }
        for(d_idx in this.doors){
            if(!this.doors[d_idx].drawn){
                this.doors[d_idx].draw();
            }
        }
        this.drawn = true;
        AHQ.the_map.place_tile(this.x, this.y, this)
    }
    this.visit = function(){}
    this.remove = function(){
        /* Remove all traces of this corridor from registries and the canvas. */
        if(this.g){
            this.g.remove();
            delete AHQ.registry_tiles[this.g.id]
        }
    }
    return this;
}
Corridor.prototype = Object.create(AHQ.DungeonTile.prototype);
Corridor.prototype.constructor = Corridor;
AHQ.Corridor = Corridor;