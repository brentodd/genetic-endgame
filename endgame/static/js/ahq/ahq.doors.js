

function Door(parent_obj, relation){
    /* A passage "section" (5 squares) can only have one door, so
    we need to decide on which wall, then determine if that section is
    already taken or not. Also, a wall in a room can only have one door,
    and a room wall can be up to 10 squares (in default ruleset). */
    AHQ.DungeonTile.call(this, parent_obj, relation);
    this.visited = false;
    // inspect parent and collect 'valid' door locations (all)
    this.valid_locations = []
    valid_walls = {n: true, e: true, s: true, w: true}
    if(this.parent.constructor == AHQ.Corridor){
        // this.parent is the corridor - of_parent will tell us direction of
        // the corridor. N/S corridor can only have doors on E or W wall, etc
        if(this.parent.of_parent == 'n' || this.parent.of_parent == 's'){
            valid_walls.n = false;
            valid_walls.s = false;
        } else {
            valid_walls.e = false;
            valid_walls.w = false
        }
    } else if (this.parent.constructor == AHQ.Room){
        // Room.of_parent tells us which wall will already have a door in it
        //   'n' means the south wall, 'e' means the west wall, 
        //   's' means the north wall, 'w' means the east wall
        // likewise, the .doors array will contain any other existing doors, so we
        // can inspect that to remove walls which already have doors
        switch(this.parent.of_parent){
            case 'n':
                valid_walls.s = false;
                break;
            case 'e':
                valid_walls.w = false;
                break;
            case 's':
                valid_walls.n = false;
                break;
            case 'w':
                valid_walls.e = false;
                break;
        }
    }
    for(dir in valid_walls){
        if(valid_walls[dir]){
            if(dir === 'n' || dir === 's'){
                dim = this.parent.width;
            } else {
                dim = this.parent.height;
            }
            for(x=0; x < dim; x++){
                this.valid_locations.push(dir+'_'+x);
            }
        }
    }

    // loop through all doors already attached to parent
    //   remove 'invalid' door locations from collection
    for(dindex in this.parent.doors){
        e_door = this.parent.doors[dindex]
        wall = e_door.chosen_loc.split('_')[0]
        loc = parseInt(e_door.chosen_loc.split('_')[1])
        /* It's not in the rules, but I'm putting in some additional
        padding around a door. Starting x at -2 and setting the loop
        condition to 7 will prevent doors within 2 of another. If 
        door is at 6, then its section starts at 5, so 5-9 are out
        already... -2 and 7 makes it 3-11*/
        for(x=-2; x < 7; x++){
            to_remove = wall+'_'+ ((Math.floor(loc/5) * 5) + x)
            if(this.valid_locations.indexOf(to_remove) >= 0){
                this.valid_locations.splice(this.valid_locations.indexOf(to_remove),1)
            }
        }
    }
    console.info('Valid Door Locations in this ' + this.parent.constructor.name)
    console.info(this.valid_locations)
    // choose from valid locations
    
    this.place_room_beyond = function(door_location, dim1, dim2){
        /* This function will take a location and room size and check to
        see if a room of that size can fit there. It RANDOMLY rotates the
        room and RANDOMLY places it with respect to the door
        */
        if(door_location){
            this.of_parent = door_location[0];
            if(this.of_parent == 'n'){
                this.x = this.parent.x + parseInt(door_location.split('_')[1]);
                this.y = this.parent.y-1;
                this.width = 1;
                this.height = 2;
            } else if(this.of_parent == 's'){
                this.x = this.parent.x + parseInt(door_location.split('_')[1])
                this.y = this.parent.y + this.parent.height-1;
                this.width = 1;
                this.height = 2;
            } else if(this.of_parent == 'e'){
                this.x = this.parent.x + this.parent.width-1;
                this.y = this.parent.y + parseInt(door_location.split('_')[1])
                this.width = 2;
                this.height = 1;
            } else if(this.of_parent == 'w'){
                this.x = this.parent.x-1;
                this.y = this.parent.y + parseInt(door_location.split('_')[1])
                this.width = 2;
                this.height = 1;
            }
        }
        random_tries = 10;
        it_fits = false;
        while(random_tries >= 0 && !it_fits){
            random_tries--;
            if(AHQ.roll(1,2) == 1){
                width = dim1;
                height = dim2;
            } else {
                width = dim2;
                height = dim1;
            }
            switch (this.of_parent){
            case 'n':
                this.room_ph_x = this.x + AHQ.between((width-1)*-1, 0); //this.parent.x + (Math.floor((this.x-this.parent.x)/5)*5);
                this.room_ph_y = this.parent.y - height;
                this.room_ph_width = width;
                this.room_ph_height = height;
                break;
            case 's':
                this.room_ph_x = this.x + AHQ.between((width-1)*-1, 0); //this.parent.x + (Math.floor((this.x-this.parent.x)/5)*5);
                this.room_ph_y = this.y + 1;
                this.room_ph_width = width;
                this.room_ph_height = height;
                break;
            case 'e':
                this.room_ph_x = this.x + 1;
                this.room_ph_y = this.y - AHQ.between((height-1), 0);//(Math.floor((this.y-this.parent.y)/5)*5);
                this.room_ph_width = width;
                this.room_ph_height = height;
                break;
            case 'w':
                this.room_ph_x = this.parent.x - width;
                this.room_ph_y = this.y - AHQ.between((height-1), 0); //(Math.floor((this.y-this.parent.y)/5)*5);
                this.room_ph_width = width;
                this.room_ph_height = height;
                break;
            }
            if(AHQ.test_placement(this.room_ph_x, this.room_ph_y, this.room_ph_width, this.room_ph_height) != null){
                // this room did not fit in this randomzied location, but the door position might still be ok
                //console.info('This test door at (' + this.x + ', ' + this.y + ')' + ' test ROOM at (' + this.room_ph_x + ', ' + this.room_ph_y + '), ' + ' and the rooms dimensions are ' + this.room_ph_width + 'x' + this.room_ph_height)
                it_fits = false
            } else {
                // We know that POTENTIALLY a room can fit here.
                it_fits = true;
            }
        }
        if(!it_fits){
            //console.debug('tried a bunch of times to get a room to fit at ' + door_location + ' to no avail')
            this.valid_locations.splice(this.valid_locations.indexOf(door_location),1)
            door_location = null;
        }
        return door_location;
    }

    /* We'll try up to 10 times to choose a location for the door, needing
    to fit at least a 5x5 room in the space. If it can't fit, we choose 
    another location.
    */
    placement_attemtps = 10;
    this.chosen_loc = null;
    while(placement_attemtps >= 0 && this.chosen_loc == null && this.valid_locations.length > 0){
        placement_attemtps--;
        // test placement
        test_at = AHQ.choose(this.valid_locations)
        console.info('Testing a Door at position ' + test_at)
        this.chosen_loc = this.place_room_beyond(test_at, 5, 5)
    }
    if(this.chosen_loc){
        console.info('Placing door at ' + this.chosen_loc)
    } else {
        console.info('After 10 attempts, could not place a 5x5 room anywhere.')
    }
    // End of constructor code
    this.draw = function(){
        if(this.chosen_loc == null){
            return;
        }
        if(this.drawn){
            return;
        }
        switch (this.of_parent){
        case 'n':
            y_scaled = ((this.y+1)*AHQ.options.scale)-AHQ.options.scale/2;
            x_scaled = (this.x*AHQ.options.scale);
            break;
        case 's':
            y_scaled = ((this.y+1)*AHQ.options.scale)-AHQ.options.scale/2;
            x_scaled = (this.x*AHQ.options.scale);
            break;
        case 'e':
            y_scaled = (this.y*AHQ.options.scale);
            x_scaled = ((this.x+1)*AHQ.options.scale)-AHQ.options.scale/2;
            break;
        case 'w':
            y_scaled = (this.y*AHQ.options.scale);
            x_scaled = ((this.x+1)*AHQ.options.scale)-AHQ.options.scale/2;
            break;
        }
        bg = AHQ.canvas.rect(x_scaled, y_scaled, AHQ.options.scale, AHQ.options.scale).attr(AHQ.options.doors);
        //grid = AHQ.canvas.rect(x_scaled, 
        //                       y_scaled, 
        //                       AHQ.options.scale, 
        //                       AHQ.options.scale).attr({fill: AHQ.pattern()});
        this.g = AHQ.canvas.g(bg);
        //console.warn('should add door to og')
        if (AHQ.the_o_g == null){
            console.warn('how the heck is og null?')
            //AHQ.the_o_g = this.g
        }
        else{
            //console.warn('adding door to og')
            AHQ.the_o_g.add(this.g)
        }

        this.room_ph = AHQ.make_placeholder(this.room_ph_x, this.room_ph_y, this.room_ph_width, this.room_ph_height, false);
        AHQ.registry_doors[this.g.id] = this;
        this.drawn = true;
        AHQ.the_map.place_tile(this.x, this.y, this)
        this.g.click(function(evt){
            d = AHQ.registry_doors[this.id];
            d.visit();
        });
    }
    this.visit = function(){
        /* Remove the placeholder, then REDO all of the room generation
        crap, but with a random room type. */
        if(this.visited === false){
            this.room_ph.remove();
            rt = AHQ.get_room_type();
            // decide dimensions
            if(rt == 'l' || rt == 'q'){
                room_dimension_1 = 10;
                room_dimension_2 = 5;
            } else {
                room_dimension_1 = 5;
                room_dimension_2 = 5;
            }
            placement_attempts = 10;
            while(placement_attempts > 0){
                placement_attempts--;
                if(this.place_room_beyond(this.chosen_loc, room_dimension_1, room_dimension_2) != null){
                    // make a room
                    room = new AHQ.Room(this, this.of_parent,
                                        this.room_ph_x, this.room_ph_y, this.room_ph_width, this.room_ph_height,
                                        rt);
                    room.draw()
                    //AHQ.canvas.rect(this.room_ph_x*AHQ.options.scale, 
                    //                this.room_ph_y*AHQ.options.scale, 
                    //                this.room_ph_width*AHQ.options.scale, 
                    //               this.room_ph_height*AHQ.options.scale).attr({fill:AHQ.pattern.grey()})
                    break;
                }
            }
            if(placement_attempts == 0){
                // we failed to place a room
                console.warn('Failed to place a room, deleting door')
                this.remove()
            }
            // loop 10 times testing placement
            // if it fits, we're done. if not, remove the door
            this.visited = true;
        }
    }
    this.remove = function(){
        console.warn('Deleting Door')
        delete AHQ.registry_doors[this.g.id];
        AHQ.the_map.delete_tile(this);
        this.g.remove();
        console.warn("door deleted")
    }
}
Door.prototype = Object.create(AHQ.DungeonTile.prototype);
Door.prototype.constructor = Door;
AHQ.Door = Door;
