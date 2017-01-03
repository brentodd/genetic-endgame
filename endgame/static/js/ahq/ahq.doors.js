(function(){

    function Door(parent_obj, relation){
        /* A passage "section" (5 squares) can only have one door, so
        we need to decide on which wall, then determine if that section is
        already taken or not. Also, a wall in a room can only have one door,
        and a room wall can be up to 10 squares (in default ruleset).
        
        When we construct a door, we will decide what is behind it (a Room vs
        Corridor), and call the constructor of that thing, which will in-turn 
        decide it's own location/features. If that thing has its OWN doors, we
        will NOT construct them - they get constructed when the thing is drawn.
        */
        AHQ.DungeonTile.call(this, parent_obj, relation);
        this.visited = false;
        this.child = null;
        this.secret_door = false;
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
        this.calculate_xy = function(door_location){
            /* This will take a location, and figure out the location and
            dimensions of the door if it were at that location.*/
            this.of_parent = door_location[0];
            if(this.of_parent == 'n'){
                this.x = this.parent.x + parseInt(door_location.split('_')[1]);
                this.y = this.parent.y-1;
                this.other_side_x = this.x;
                this.other_side_y = this.y; // heading north through door, other side is this.y!
                this.width = 1;
                this.height = 2;
            } else if(this.of_parent == 's'){
                this.x = this.parent.x + parseInt(door_location.split('_')[1])
                this.y = this.parent.y + this.parent.height-1;
                this.other_side_x = this.x;
                this.other_side_y = this.y+1;
                this.width = 1;
                this.height = 2;
            } else if(this.of_parent == 'e'){
                this.x = this.parent.x + this.parent.width-1;
                this.y = this.parent.y + parseInt(door_location.split('_')[1])
                this.other_side_x = this.x+1;
                this.other_side_y = this.y;
                this.width = 2;
                this.height = 1;
            } else if(this.of_parent == 'w'){
                this.x = this.parent.x-1;
                this.y = this.parent.y + parseInt(door_location.split('_')[1])
                this.other_side_x = this.x;
                this.other_side_y = this.y;
                this.width = 2;
                this.height = 1;
            }
        }
        // We'll try up to 10 times to choose a location for the door
        placement_attemtps = 10;
        this.chosen_loc = null;
        while(placement_attemtps >= 0 && this.chosen_loc == null && this.valid_locations.length > 0){
            placement_attemtps--;
            test_at = AHQ.choose(this.valid_locations);
            //console.info('Testing a Door at position ' + test_at)
            this.calculate_xy(test_at);
            // Check if room/corridor already on this.other_side, if so, we are good
            // complications: if there's already another door in that 5 square section
            //                we would PREFER to make a new thing, not reuse existing
            at_other_side = AHQ.the_map.get(this.other_side_x, this.other_side_y)
            if(at_other_side){
                for(x=0; x < at_other_side.length; x++){
                    if(at_other_side[x].constructor == AHQ.Room){
                        this.chosen_loc = test_at;
                        this.child = at_other_side[x];
                        // add self to that room's doors
                        at_other_side[x].doors.push(this)
                        this.secret_door = true;
                    } else if (at_other_side[x].constructor == AHQ.Corridor){
                        this.chosen_loc = test_at;
                        this.child = at_other_side[x];
                        // add self to that corridor's doors
                        at_other_side[x].doors.push(this)
                        this.secret_door = true;
                    } else if (at_other_side[x].constructor == AHQ.Junction){
                        // kind of cool
                        this.chosen_loc = test_at;
                        this.child = at_other_side[x];
                        console.warn("Junctions don't really support doors yet")
                        at_other_side[x].doors.push(this)
                        this.secret_door = true;
                    } else if (at_other_side[x].constructor.name == 'Placeholder') {
                        // if this is a placeholder, we would need to link this door
                        // to the thing for which we are holding the place, not the
                        // placeholder itself - which means the placeholder needs some
                        // more information...
                        console.warn('Door to placeholer - need to work some magic')
                    }
                }
            } else {
                if(this.parent.constructor == AHQ.Room && AHQ.choose([true,false])){
                    test_room = new AHQ.Corridor(this, this.of_parent == 'n' ? 'e' : this.of_parent == 's' ? 'w' : this.of_parent == 'w' ? 'n' : 's');
                } else {
                    test_room = new AHQ.Room(this, this.of_parent);
                }

                if(test_room.x < 0 || test_room.y < 0 
                    || test_room.x >= AHQ.options.max_x || test_room.y >= AHQ.options.max_y
                    || test_room.width <= 0 || test_room.height <= 0){
                    test_room.remove();
                } else if(AHQ.test_placement(test_room.x, test_room.y, test_room.width, test_room.height, true) != null){
                    // this room did not fit in this randomzied location, but the door position might still be ok
                    //console.info('This test door at (' + this.x + ', ' + this.y + ')' + ' test ROOM at (' + test_room.x + ', ' + test_room.y + '), ' + ' and the rooms dimensions are ' + test_room.width + 'x' + test_room.height)
                    test_room.remove();
                } else {
                    this.chosen_loc = test_at;
                    this.child = test_room;
                    test_room.make_placeholder();
                }
            }
        }
        if(this.chosen_loc){
            //console.info('Placing door at ' + this.chosen_loc)
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
            this.g = AHQ.canvas.g(bg);
            if (AHQ.the_o_g == null){
                console.warn('how the heck is og null?')
            }
            else{
                AHQ.the_o_g.add(this.g)
            }
            if(this.secret_door){
                AHQ.annotate(this, 'S');
            }
            AHQ.registry_doors[this.g.id] = this;
            this.drawn = true;
            AHQ.the_map.place_tile(this.x, this.y, this)
            this.g.click(function(evt){
                d = AHQ.registry_doors[this.id];
                d.visit();
            });
        }
        this.visit = function(){
            if(this.visited === false){
                if(this.child){
                    // we've already decided what and where child is, but since
                    // then a new tile may have stolen that spot. Need to check
                    // if there's still room?
                    //if(AHQ.test_placement(test_room.x, test_room.y, test_room.width, test_room.height) != null){
                    //    this.child.remove();
                    //    this.remove();
                    //} else {
                        this.child.draw();
                    //}
                }
                this.visited = true;
            }
        }
        this.remove = function(){
            console.warn('Deleting Door')
            delete AHQ.registry_doors[this.g.id];
            AHQ.the_map.delete_tile(this);
            this.g.remove();
            if(this.child){
                this.child.remove();
            }
            console.warn("door deleted")
        }
    }
    Door.prototype = Object.create(AHQ.DungeonTile.prototype);
    Door.prototype.constructor = Door;
    AHQ.Door = Door;
})(AHQ || {})