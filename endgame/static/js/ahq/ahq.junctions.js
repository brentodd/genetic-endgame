(function(){
    function JunctionConnector(parent_obj, relation){
        // JunctionConnector is invisible and just lays over the ends of junctions so we can pass through
        // relation is either N,S,E, or W
        // if it's S of parent, then our x is parent_obj.x, our y is parent_obj.y+1
        AHQ.DungeonTile.call(this, parent_obj, relation);
        switch(relation.toLowerCase()){
            case 'n':
                this.x = parent_obj.x
                this.y = parent_obj.y - 1
                break;
            case 's':
                this.x = parent_obj.x
                this.y = parent_obj.y + 1
                break;
            case 'e':
                this.x = parent_obj.x + 1
                this.y = parent_obj.y
                break;
            case 'w':
                this.x = parent_obj.x - 1
                this.y = parent_obj.y
                break;
        }
        this.width=2
        this.height=2
        this.visit = function(){}
        this.draw = function(){}
    }
    JunctionConnector.prototype = Object.create(AHQ.DungeonTile.prototype);
    JunctionConnector.prototype.constructor = JunctionConnector;
    AHQ.JunctionConnector = JunctionConnector;

    function Junction(parent_obj, relation, type){
        /* A Junction is a DungeonTile which connects Corridors. It can
        either be a Right-Turn, Left-Turn, T-Junction, Dead-End, Stairs-Out, or
        Stairs-Down.
        It has 4 :exit: properties - N, S, E, W - which can either be corridors
        or null. Null represent a wall - so not a real exit.
        
        Constructor will place :placeholder: corridors of length 7 at each exit
        to prevent other tiles being placed there.
            .draw(): will render itself only.
            .visit(): will generate new Corridors for each exit and immediately
                        .draw() them.
        
        */
        AHQ.DungeonTile.call(this, parent_obj, relation);
        //his.visited = false;
        // Wall/Exit locations
        this.north = this.south = this.east = this.west = 'unknown';
        /* Determine Junction Type, which will tell us what exits we need */
        this.width = 2;
        this.height = 2;
        this.doors = [];
        if(!parent_obj){
            // no parent - must be entrance, so it's a "Stairs-Out"
            this.type = 'out';
            this.x = AHQ.options.start_x;
            this.y = AHQ.options.start_y;
        }
        else{
            this.type = type || AHQ.get_passage_end();
            /* Set the 'end' of the parent corridor to be this junction.
                TODO: when creating a junction off of a ROOM, we'll be manually
                setting the 'start' of the junction too - so that needs to be
                considered.
            */
            if(this.parent.end != null){
                // we need to remove the existing end of the corridor
                this.parent.end.remove();
            }
            this.parent.end = this;
            /* A junction (entrance aside) is ALWAYS spawned from a corridor, and
            is ALWAYS 2x2. Our (x,y) is based on the (x,y) of parent object END, or
            in the case of spawning a new corridor off of a room door, we make two
            junctions, so one of them is placed based on the (x,y) of the corridor
            START. But parent_obj in that case is STILL a corridor
            */
            switch(this.of_parent.toLowerCase()){
            case 'n':
                this.x = this.parent.x;
                this.y = this.parent.y-2;
                this.south = this.parent;
                break;
            case 's':
                this.x = this.parent.x;
                this.y = this.parent.y + this.parent.height;
                this.north = this.parent;
                break;
            case 'e':
                this.x = this.parent.x + this.parent.width;
                this.y = this.parent.y;
                this.west = this.parent;
                break;
            case 'w':
                this.x = this.parent.x - 2;
                this.y = this.parent.y;
                this.east = this.parent;
                break;
            }
            cnx = new AHQ.JunctionConnector(this, this.of_parent == 's'?'n': this.of_parent=='n'? 's': this.of_parent=='w'? 'e' : 'w')
            //console.debug(cnx)
            AHQ.the_map.place_tile(cnx.x, cnx.y, cnx)
        }
        if(this.type.toLowerCase() == 'out' || this.type.toLowerCase() == 'down' || this.type.toLowerCase() == 'end'){
            switch(this.of_parent.toLowerCase()){
            case 'n':
                this.north = null;
                this.east = null;
                this.west = null;
                break;
            case 's':
                this.south = null;
                this.east = null;
                this.west = null;
                break;
            case 'e':
                this.north = null;
                this.south = null;
                this.east = null;
                break;
            case 'w':
                this.north = null;
                this.south = null;
                this.west = null;
                break;
            }
        } else if (this.type.toLowerCase() == 'left'){
            switch(this.of_parent.toLowerCase()){
            case 'n':
                this.north = null;
                this.east = null;
                break;
            case 's':
                this.south = null;
                this.west = null;
                break;
            case 'e':
                this.north = null;
                this.east = null;
                break;
            case 'w':
                this.south = null;
                this.west = null;
                break;
            }
        } else if (this.type.toLowerCase() == 'right'){
            switch(this.of_parent.toLowerCase()){
            case 'n':
                this.north = null;
                this.west = null;
                break;
            case 's':
                this.south = null;
                this.east = null;
                break;
            case 'e':
                this.south = null;
                this.east = null;
                break;
            case 'w':
                this.north = null;
                this.west = null;
                break;
            }
        } else if (this.type.toLowerCase() == 't'){
            switch(this.of_parent.toLowerCase()){
            case 'n':
                this.north = null;
                break;
            case 's':
                this.south = null;
                break;
            case 'e':
                this.east = null;
                break;
            case 'w':
                this.west = null;
                break;
            }
        }
        // Object Methods
//        this.
//        this.visit = 
//        this.remove = 
    }
    Junction.prototype = Object.create(AHQ.DungeonTile.prototype);
    Junction.prototype.constructor = Junction;

    Junction.prototype.visit = function(){
        /* Generate new corridor for each exit, then immediately draw them */
        Object.getPrototypeOf(Junction.prototype).visit.call(this);
        if(! this.visited){
            if(this.north && this.north.constructor.name == 'Placeholder'){
                /* Remove any placeholder corridor, and build a new corridor.*/
                delete AHQ.registry_placeholders[this.north.g.id];
                this.north.g.remove();
                this.north = new AHQ.Corridor(this, 'n');
                if(this.north.height <= 0){
                    // corridor constructor couldn't make anything fit, wall it
                    this.north.remove();
                    this.north = null;
                    this.g.add(AHQ.canvas.path(this.wall_north).attr(AHQ.options.walls))
                } else {
                    cnx = new AHQ.JunctionConnector(this, 'n')
                    AHQ.the_map.place_tile(cnx.x, cnx.y, cnx)
                    this.north.draw();
                    this.north.visit();
                }
            } else if (this.north && this.north.constructor.name == 'Corridor'){
                /* Already have a corridor here, just draw it.*/
                cnx = new AHQ.JunctionConnector(this, 'n')
                AHQ.the_map.place_tile(cnx.x, cnx.y, cnx)
                this.north.draw();
                this.north.visit();
            }
            if(this.south && this.south.constructor.name == 'Placeholder'){
                /* Remove any placeholder corridor, and build a new corridor.*/
                delete AHQ.registry_placeholders[this.south.g.id];
                this.south.g.remove();
                this.south = new AHQ.Corridor(this, 's');
                if(this.south.height <= 0){
                    this.south.remove();
                    this.south = null;
                    this.g.add(AHQ.canvas.path(this.wall_south).attr(AHQ.options.walls))
                } else {
                    cnx = new AHQ.JunctionConnector(this, 's')
                    AHQ.the_map.place_tile(cnx.x, cnx.y, cnx)
                    this.south.draw();
                    this.south.visit();
                }
            } else if (this.south && this.south.constructor.name == 'Corridor'){
                /* Already have a corridor here, just draw it.*/
                cnx = new AHQ.JunctionConnector(this, 's')
                AHQ.the_map.place_tile(cnx.x, cnx.y, cnx)
                this.south.draw();
                this.south.visit();
            }
            if(this.east && this.east.constructor.name == 'Placeholder'){
                /* Remove any placeholder corridor, and build a new corridor.*/
                delete AHQ.registry_placeholders[this.east.g.id];
                this.east.g.remove();
                this.east = new AHQ.Corridor(this, 'e');
                if(this.east.width <= 0){
                    this.east.remove();
                    this.east = null;
                    this.g.add(AHQ.canvas.path(this.wall_east).attr(AHQ.options.walls))
                } else {
                    cnx = new AHQ.JunctionConnector(this, 'e')
                    AHQ.the_map.place_tile(cnx.x, cnx.y, cnx)
                    this.east.draw()
                    this.east.visit();
                };
            } else if (this.east && this.east.constructor.name == 'Corridor'){
                /* Already have a corridor here, just draw it.*/
                cnx = new AHQ.JunctionConnector(this, 'e')
                AHQ.the_map.place_tile(cnx.x, cnx.y, cnx)
                this.east.draw();
                this.east.visit();
            }
            if(this.west && this.west.constructor.name == 'Placeholder'){
                /* Remove any placeholder corridor, and build a new corridor.*/
                delete AHQ.registry_placeholders[this.west.g.id];
                this.west.g.remove();
                this.west = new AHQ.Corridor(this, 'w');
                if(this.west.width <= 0){
                    this.west.remove();
                    this.west = null;
                    this.g.add(AHQ.canvas.path(this.wall_west).attr(AHQ.options.walls))
                } else {
                    cnx = new AHQ.JunctionConnector(this, 'w')
                    AHQ.the_map.place_tile(cnx.x, cnx.y, cnx)
                    this.west.draw();
                    this.west.visit();
                }
            } else if (this.west && this.west.constructor.name == 'Corridor'){
                /* Already have a corridor here, just draw it.*/
                cnx = new AHQ.JunctionConnector(this, 'w')
                AHQ.the_map.place_tile(cnx.x, cnx.y, cnx)
                this.west.draw();
                this.west.visit();
            }
            this.visited = true;
        }
        AHQ.bring_doors_to_front();
    }

    Junction.prototype.draw = function(){
        Object.getPrototypeOf(Junction.prototype).draw.call(this);
        if(this.drawn){
            return
        }
        // make placeholders off of each 'unknown' exit.
        // A placeholder must be 7 squares long
        if(this.north == 'unknown'){
            ph_x = this.x;
            ph_y = this.y - 7;
            ph_width = 2;
            ph_height = 7;
            if(AHQ.test_placement(ph_x,ph_y,ph_width,ph_height) != null){
                this.north = null
            } else {
                this.north = AHQ.make_placeholder(ph_x,ph_y,ph_width,ph_height, true);
            }
        }
        if(this.south == 'unknown'){
            ph_x = this.x;
            ph_y = this.y + 2;
            ph_width = 2;
            ph_height = 7;
            if(AHQ.test_placement(ph_x,ph_y,ph_width,ph_height) != null){
                this.south = null
            } else {
                this.south = AHQ.make_placeholder(ph_x,ph_y,ph_width,ph_height, true);
            }
        }
        if(this.east == 'unknown'){
            ph_x = this.x + 2;
            ph_y = this.y;
            ph_width = 7;
            ph_height = 2;
            if(AHQ.test_placement(ph_x,ph_y,ph_width,ph_height) != null){
                this.east = null
            } else {
                this.east = AHQ.make_placeholder(ph_x,ph_y,ph_width,ph_height, true);
            }
        }
        if(this.west == 'unknown'){
            ph_x = this.x - 7;
            ph_y = this.y;
            ph_width = 7;
            ph_height = 2;
            if(AHQ.test_placement(ph_x,ph_y,ph_width,ph_height) != null){
                this.west = null
            } else {
                this.west = AHQ.make_placeholder(ph_x,ph_y,ph_width,ph_height, true);
            }
        }
        x_scaled = this.x*AHQ.options.scale;
        y_scaled = this.y*AHQ.options.scale;
        width_scaled = this.width*AHQ.options.scale;
        height_scaled = this.height*AHQ.options.scale;
        bg = AHQ.canvas.rect(x_scaled, y_scaled, width_scaled, height_scaled).attr({fill: AHQ.pattern.brown()});
        wall_nudge = AHQ.options.walls.strokeWidth/2
        grid = AHQ.canvas.rect(x_scaled, y_scaled, width_scaled, height_scaled).attr({fill: AHQ.grid_pattern()});
        this.wall_east = "M"+(x_scaled+width_scaled-wall_nudge)+","+y_scaled+"L"+(x_scaled+width_scaled-wall_nudge)+","+(y_scaled+height_scaled);
        this.wall_west = "M"+(x_scaled+wall_nudge)+","+y_scaled+"L"+(x_scaled+wall_nudge)+","+(y_scaled+height_scaled);
        this.wall_south = "M"+x_scaled+","+(y_scaled+height_scaled-wall_nudge)+"L"+(x_scaled+width_scaled)+","+(y_scaled+height_scaled-wall_nudge)
        this.wall_north = "M"+x_scaled+","+(y_scaled+wall_nudge)+"L"+(x_scaled+width_scaled)+","+(y_scaled+wall_nudge)
        this.g = AHQ.canvas.g(bg,grid);

        if (AHQ.the_o_g == null){
            AHQ.the_o_g = this.g
        }
        else{
            AHQ.the_o_g.add(this.g)
        }

        if(this.type == 'out'){
            AHQ.annotate(this, 'O');
        }
        if(this.type == 'down'){
            AHQ.annotate(this, 'D');
        }
        if(this.north == null){
            this.g.add(AHQ.canvas.path(this.wall_north).attr(AHQ.options.walls));
        }
        if(this.south == null){
            this.g.add(AHQ.canvas.path(this.wall_south).attr(AHQ.options.walls));
        }
        if(this.east == null){
            this.g.add(AHQ.canvas.path(this.wall_east).attr(AHQ.options.walls));
        }
        if(this.west == null){
            this.g.add(AHQ.canvas.path(this.wall_west).attr(AHQ.options.walls));
        }
        AHQ.registry_tiles[this.g.id] = this;
        //console.info('this junction id is: ' + this.g.id)
        //console.info('after everything')
        //console.info(this.g.getBBox())
        this.drawn = true;
        AHQ.the_map.place_tile(this.x, this.y, this)
        this.g.click(function(evt){
            /* in this click handler, 'this' is actually the SVG element,
            NOT the Junction object. Get the Junction from the registry
            by using the id. */
            j = AHQ.registry_tiles[this.id];
            //console.info(this)
            //console.info('what was clicked: ' +this.id)
            //console.info('the_og is:        ' + AHQ.the_o_g.id)
            //console.info(evt)
            //console.error(j)
            b = j.g.getBBox()
            if(b.width>AHQ.scale*2 || b.height>AHQ.scale*2){
                console.error('Bounding box on junction larger than it should be')
                console.error(b)
                AHQ.canvas.rect(b.x, b.y, b.width, b.height).attr({stroke: '#f00', strokeWidth: '2px',fillOpacity:0})
            }
            j.visit();
            evt.stopPropagation();
        })
    }

    Junction.prototype.remove = function(){
        Object.getPrototypeOf(Junction.prototype).remove.call(this);
        /* Remove all traces of this corridor from registries and the canvas. */
        if(this.north && this.north.g){
            //delete AHQ.registry_placeholders[this.north.g.id]
            this.north.remove()
        }
        if(this.south && this.south.g){
            //delete AHQ.registry_placeholders[this.south.g.id]
            this.south.remove()
        }
        if(this.east && this.east.g){
            //delete AHQ.registry_placeholders[this.east.g.id]
            this.east.remove()
        }
        if(this.west && this.west.g){
            //delete AHQ.registry_placeholders[this.west.g.id]
            this.west.remove()
        }
        if(this.g){
            delete AHQ.registry_tiles[this.g.id]
            this.g.remove();
        }
    }
    AHQ.Junction = Junction;
})(AHQ || {})