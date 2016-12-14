function Room(parent_obj, relation, x, y, w, h, room_type){
    AHQ.DungeonTile.call(this, parent_obj, relation);
    // room is made when door is made
    // door passes in it's location
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.room_type = room_type;
    this.of_parent = relation;
    this.doors = []
    this.draw = function(){
        // figures out if it has doors and where they are
        //  (leave it up to the door to decide what's beind it)
        // draw self, draw doors
        x_scaled = this.x*AHQ.options.scale;
        y_scaled = this.y*AHQ.options.scale;
        width_scaled = this.width*AHQ.options.scale;
        height_scaled = this.height*AHQ.options.scale;
        if(this.room_type === 'q'){
            bg = AHQ.canvas.rect(x_scaled, y_scaled, width_scaled, height_scaled).attr({fill: AHQ.pattern.purple()});
        } else if (this.room_type === 'l'){
            bg = AHQ.canvas.rect(x_scaled, y_scaled, width_scaled, height_scaled).attr({fill: AHQ.pattern.blue()});
        } else if (this.room_type === 'h'){
            bg = AHQ.canvas.rect(x_scaled, y_scaled, width_scaled, height_scaled).attr({fill: AHQ.pattern.grey()});
        } else {
            // empty room
            bg = AHQ.canvas.rect(x_scaled, y_scaled, width_scaled, height_scaled).attr({fill: AHQ.pattern.brown()});
        }
        
        wall_nudge = AHQ.options.walls.strokeWidth/2
        grid = AHQ.canvas.rect(x_scaled, y_scaled, width_scaled, height_scaled).attr({fill: AHQ.grid_pattern()});
        wall_east = "M"+(x_scaled+width_scaled-wall_nudge)+","+y_scaled+"L"+(x_scaled+width_scaled-wall_nudge)+","+(y_scaled+height_scaled);
        wall_west = "M"+(x_scaled+wall_nudge)+","+y_scaled+"L"+(x_scaled+wall_nudge)+","+(y_scaled+height_scaled);
        wall_south = "M"+x_scaled+","+(y_scaled+height_scaled-wall_nudge)+"L"+(x_scaled+width_scaled)+","+(y_scaled+height_scaled-wall_nudge)
        wall_north = "M"+x_scaled+","+(y_scaled+wall_nudge)+"L"+(x_scaled+width_scaled)+","+(y_scaled+wall_nudge)
        this.g = AHQ.canvas.g(bg,grid);
        this.g.add(AHQ.canvas.path(wall_east).attr(AHQ.options.walls));
        this.g.add(AHQ.canvas.path(wall_west).attr(AHQ.options.walls));
        this.g.add(AHQ.canvas.path(wall_south).attr(AHQ.options.walls));
        this.g.add(AHQ.canvas.path(wall_north).attr(AHQ.options.walls));
        if (AHQ.the_o_g == null){
            AHQ.the_o_g = this.g
        }
        else{
            AHQ.the_o_g.add(this.g)
        }
        AHQ.registry_tiles[this.g.id] = this;

        // Figure out how many ADDITIONAL doors there are in this room (already has 1)
        num_additional_doors = AHQ.get_room_doors();
        //console.debug(num_additional_doors + ' additional doors in this room')
        // Place the additional doors
        // this.of_parent is wehre the existing door is, so choose other three walls
        while(num_additional_doors>0){
            d = new AHQ.Door(this);
            if(d.chosen_loc != null){
                this.doors.push(d);
                d.draw();
            }
            num_additional_doors--;
        }
        this.drawn = true;
        AHQ.the_map.place_tile(this.x, this.y, this)
    }
    this.visit = function(){
        // do nothing special
    }
};
Room.prototype = Object.create(AHQ.DungeonTile.prototype);
Room.prototype.constructor = Room;
AHQ.Room = Room;