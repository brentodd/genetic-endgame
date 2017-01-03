(function(){
    function Room(parent_obj, relation){
        AHQ.DungeonTile.call(this, parent_obj, relation);
        
        this.room_type = AHQ.get_room_type()
        // TODO: update get_room_type so that dimensions are contained in ahq.js
        if(this.room_type === 'l' || this.room_type === 'q'){
            if(AHQ.choose([true,false])){
                this.width = 10;
                this.height = 5;
            } else {
                this.width = 5;
                this.height = 10;
            }
        } else {
            this.width = 5;
            this.height = 5;
        }
        this.of_parent = relation;
        switch (parent_obj.of_parent){
            case 'n':
                this.x = parent_obj.x + AHQ.between((this.width-1)*-1, 0);
                this.y = parent_obj.y+1 - this.height;
                break;
            case 's':
                this.x = parent_obj.x + AHQ.between((this.width-1)*-1, 0);
                this.y = parent_obj.y+1;
                break;
            case 'e':
                this.x = parent_obj.x + 1;
                this.y = parent_obj.y - AHQ.between((this.height-1), 0);
                break;
            case 'w':
                this.x = parent_obj.x + 1 - this.width;
                this.y = parent_obj.y - AHQ.between((this.height-1), 0);
                break;
        }
        this.doors = [];

        this.make_placeholder = function(){
            /* Rooms are placed semi-randomly behind doors, and in the process we check if
            the room will even FIT in the random location. So we don't want to make a 
            placeholder in the constructor (or it'd block itself). */
            this.placeholder = AHQ.make_placeholder(this.x,this.y,
                                                    this.width,this.height,
                                                    false)
        }

        this.draw = function(){
            // figures out if it has doors and where they are
            //  (leave it up to the door to decide what's beind it)
            // draw self, draw doors
            if(this.placeholder){
                this.placeholder.remove();
            }
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
            // this.of_parent is where the existing door is, so choose other three walls
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
        this.remove = function(){
            if(this.placeholder){
                this.placeholder.remove()
            }
        }
    };
    Room.prototype = Object.create(AHQ.DungeonTile.prototype);
    Room.prototype.constructor = Room;
    AHQ.Room = Room;
})(AHQ || {})