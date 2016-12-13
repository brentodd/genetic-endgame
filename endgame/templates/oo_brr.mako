<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="/static/lib/snap/snap.svg-min.js"></script>
        <style>
        body{padding:0;margin:0;}
        #svg {
            border: solid 2px #ccc;
            background-color: #000;
            /*width: 600;*/
            height: auto;
            display:block;
            float: left;
            margin-right: 10px;
            font: 1em source-sans-pro, Source Sans Pro, Helvetica, sans-serif;
        }
        </style>
  <!-- Latest compiled and minified CSS -->
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    </head>
    <body>
        <svg id="svg" class="col-sm-offset-1 col-sm-10">
        </svg>

  <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
  <!-- Latest compiled and minified JavaScript -->
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
    </body>
    <script>
    
    var AHQ = AHQ || {
        canvas: null,
        the_map: null,
        the_o_g: null,
        gt: {x:0, y:0}, //gt == global translate, x and y are current translate
        options: {scale: 12,  // square size in pixels
                  fontSize: 12,
                  max_x: 80,    // Maximum width of the map (E-W)
                  max_y: 65,    // Maximum height of the map (N-S)
                  start_x: 24,  // X of starting square of dungeon
                  start_y: 12,  // Y of starting square of dungeon
                  start_from: 'n', // stairs down come from what direction?
                  walls: {stroke: "#aaf",
                          strokeWidth: 1},
                  placeholders: {fill:"none"},
                  doors: {stroke: "#633",
                          strokeWidth: 1,
                          fill:"#fff"}},
        table_passage_length: [5,5,10,10,10,10,10,10,15,15,15,15],
        table_passage_end: ['cannot get here','t', 't', 'end', 'end', 
                'end', 'end', 'end', 'right', 'right', 
                'right', 't', 't', 't', 'left',
                'left', 'left', 'down', 'down', 
                'out', 'out', 'out', 't', 
                't'],
        get_passage_end: function(){
            return AHQ.table_passage_end[AHQ.roll(2,12)-1]
        },
        table_passage_feature: ['cannot get this', 'Wandering Monsters!', 
            'Wandering Monsters!', 'Wandering Monsters!', 'Nothing', 'Nothing',
            'Nothing', 'Nothing', 'Nothing', 'Nothing', 'Nothing', 'Nothing',
            'Nothing', 'Nothing', 'Nothing', '1 Door', '1 Door', '1 Door', 
            '1 Door', '2 Doors', '2 Doors', 'Wandering Monsters!', 
            'Wandering Monsters!', 'Wandering Monsters!'],
        get_passage_feature: function(){
            return AHQ.table_passage_feature[AHQ.roll(2,12)-1]
        },
        // Room Type Table, roll 1d12
        table_room_type: ['n','n','n','n','n','n','h','h','l','l','q','q'],
        get_room_type: function(){ return AHQ.choose(AHQ.table_room_type)},
        // Room Doors Table, roll 1d12, 
        table_room_doors: [0,0,0,0,1,1,1,1,2,2,2,2],
        get_room_doors: function(){return AHQ.choose(AHQ.table_room_doors)},
        between: function(min,max){
            return Math.floor(Math.random()*(max-min+1)+min);
        },
        choose: function(array){
            return array[Math.floor(Math.random() * array.length)];
        },
        roll: function(num,size){
            result = 0;
            for(x=1; x<=num; x++){
                r = Math.floor(Math.random() * size) + 1
                result += r
            }
            return result;
        },
        annotate: function(tile, text){
            tilebbox = tile.g.getBBox()
            t = AHQ.canvas.text(tilebbox.x + (tilebbox.width/2),
                                tilebbox.y + (tilebbox.height/2) + (AHQ.options.fontSize/2),
                                text).attr({textAnchor: "middle",
                                            fontSize: AHQ.options.fontSize})
            if(tilebbox.height > tilebbox.width){
                t.transform('r90')
            }
            tile.g.add(t)
        },
        pattern_singleton: {blue: null,
                            brown: null,
                            grey: null,
                            purple: null},
        grid_pattern_singleton: null,
        grid_pattern: (function(){
            function createPattern(){
                ptrn = "M0,0L0,"+AHQ.options.scale+
                       "M0,0L"+AHQ.options.scale+",0"+
                       "M"+AHQ.options.scale+",0L"+AHQ.options.scale+","+AHQ.options.scale+
                       "M0,"+AHQ.options.scale+"L"+AHQ.options.scale+","+AHQ.options.scale;
                var o = AHQ.canvas.path(ptrn).attr({stroke:"#000",strokeWidth:1})
                                         .toPattern(0, 0, AHQ.options.scale, AHQ.options.scale);
                return o;
            }
            if(!AHQ.grid_pattern_singleton){
                AHQ.grid_pattern_singleton = createPattern();
            }
            return AHQ.grid_pattern_singleton;
        }),
        pattern: {blue: (function(){
                            function createPattern(){
                                img = AHQ.canvas.image("/static/img/ahq/bg/bluish.png", 0, 0, 620, 620)
                                                .transform('s' + (AHQ.options.scale/62.0) + ',' + (AHQ.options.scale/62.0)
                                                            + 't' + (AHQ.options.scale*1.5) + ',' + (AHQ.options.scale*1.5))
                                                .toPattern()
                                return img
                            }
                            if(!AHQ.pattern_singleton.blue){
                                AHQ.pattern_singleton.blue = createPattern();
                            }
                            return AHQ.pattern_singleton.blue;
                  }),
                  brown: (function(){
                      function createPattern(){
                          img = AHQ.canvas.image("/static/img/ahq/bg/brownish.png", 0, 0, 620, 620)
                                          .transform('s' + (AHQ.options.scale/62.0) + ',' + (AHQ.options.scale/62.0)
                                                      + 't' + (AHQ.options.scale*1.5) + ',' + (AHQ.options.scale*1.5))
                                          .toPattern()
                          return img
                      }
                      if(!AHQ.pattern_singleton.brown){
                          AHQ.pattern_singleton.brown = createPattern();
                      }
                      return AHQ.pattern_singleton.brown;
                  }),
                  grey: (function(){
                            function createPattern(){
                                img = AHQ.canvas.image("/static/img/ahq/bg/greyish.png", 0, 0, 620, 620)
                                                .transform('s' + (AHQ.options.scale/62.0) + ',' + (AHQ.options.scale/62.0)
                                                            + 't' + (AHQ.options.scale*1.5) + ',' + (AHQ.options.scale*1.5))
                                                .toPattern()
                                return img
                            }
                            if(!AHQ.pattern_singleton.grey){
                                AHQ.pattern_singleton.grey = createPattern();
                            }
                            return AHQ.pattern_singleton.grey;
                        }),
                  purple: (function(){
                            function createPattern(){
                                img = AHQ.canvas.image("/static/img/ahq/bg/purple.png", 0, 0, 620, 620)
                                                .transform('s' + (AHQ.options.scale/62.0) + ',' + (AHQ.options.scale/62.0)
                                                            + 't' + (AHQ.options.scale*1.5) + ',' + (AHQ.options.scale*1.5))
                                                .toPattern()
                                return img
                            }
                            if(!AHQ.pattern_singleton.purple){
                                AHQ.pattern_singleton.purple = createPattern();
                            }
                            return AHQ.pattern_singleton.purple;
                        }),
        },
        registry_tiles: {},
        registry_placeholders: {},
        registry_doors: {},
        bring_doors_to_front: function(){
            for( key in AHQ.registry_doors ){
                //AHQ.canvas.append(AHQ.registry_doors[key].g)
                AHQ.the_o_g.append(AHQ.registry_doors[key].g)
            }
        },
        make_placeholder: function(x,y,width,height, display){
            /* A function which creates a Placeholder object. Placeholder
            object constructor is hidden - can only be created via this
            function.
            */
            function Placeholder(x,y,width,height,display){
                this.x = x;
                this.y = y;
                this.width = width;
                this.height = height;
                this.display = display; // we don't want to display room placeholders
                x = (x * AHQ.options.scale)+1;
                y = (y * AHQ.options.scale)+1;
                width = (width * AHQ.options.scale)-2;
                height = (height * AHQ.options.scale)-2;
                //this.g = AHQ.canvas.rect(x, y, width, height).attr(AHQ.options.placeholders);
                bg = AHQ.canvas.rect(x, y, width, height);
                grid = AHQ.canvas.rect(x, y, width, height);
                if (this.display === true){
                    bg.attr({fill: "#fff", fillOpacity:0.3});
                    grid.attr({fill: AHQ.pattern.grey(), fillOpacity:0.3})
                }
                this.g = AHQ.canvas.g(bg,grid);
                if (AHQ.the_o_g == null){
                }
                else{
                    AHQ.the_o_g.add(this.g)
                }
                AHQ.registry_placeholders[this.g.id] = this;
                
                this.remove = function(){
                    if(this.g){
                        this.g.remove();
                    }
                    delete AHQ.registry_placeholders[this.g.id];
                }
            }
            return new Placeholder(x,y,width,height, display);
        },
        test_placement: function(x, y, width, height, test_placeholders){
            /* Take dimensions of potential new tile and check if it overlaps
            any existing tiles or placeholders. If there is an overlap, will 
            return the ID of the element in the registry. If there's no overlap
            it will return null.
            */
            test_placeholders = test_placeholders === false ? false : true;
            new_tile = AHQ.canvas.rect((x*AHQ.options.scale)+1, 
                                       (y*AHQ.options.scale)+1, 
                                       (width*AHQ.options.scale)-2, 
                                       (height*AHQ.options.scale)-2).attr(AHQ.options.placeholders);
            //console.info('Placeholder test tile: ' + new_tile)
            b1 = new_tile.getBBox();
            //console.info('Placeholder bbox is:')
            //console.info(b1)
            if(x < 0 || y < 0){
                new_tile.remove();
                return 'off map';
            }
            for( key in AHQ.registry_tiles ){
                if (key != AHQ.the_o_g.id){
                    if(Snap.path.isBBoxIntersect(b1, AHQ.registry_tiles[key].g.getBBox())){
                        new_tile.remove();
                        //console.info('The new tile would overlap an existing tile')
                        //console.info(AHQ.registry_tiles[key])
                        //console.info(AHQ.registry_tiles[key].g.getBBox())
                        //console.warn('OG id is ' + AHQ.the_o_g.id + ' and the blocker id is ' + key)
                        return key;
                    }
                } else {
                    // we do need to check if we're overlapping with the entrance, but the OG is EVERYTHING
                    // So we can recalculate where the og is and make a bbox of it.
                    tx = (AHQ.options.start_x*AHQ.options.scale)+1;
                    ty = (AHQ.options.start_y*AHQ.options.scale+1);
                    tw = (2*AHQ.options.scale)-2;
                    th = (2*AHQ.options.scale)-2;
                    tt = AHQ.canvas.rect(tx,ty,tw,th).attr(AHQ.options.placeholders);
                    b2 = tt.getBBox()
                    if(Snap.path.isBBoxIntersect(b1, b2)){
                        // this overlaps the intrance tile
                        tt.remove();
                        return key;
                    }
                }
            }
            if(test_placeholders){
                for( key in AHQ.registry_placeholders ){
                    if(Snap.path.isBBoxIntersect(b1, AHQ.registry_placeholders[key].g.getBBox())){
                        new_tile.remove();
                        return key;
                    }
                }
            }
            new_tile.remove();
            return null;
        }
    };
    function DungeonTile(parent_obj, relation){
        /* A DungeonTile is anything we draw on the map while exploring the
        dungeon, for example a Corridor, a Room, a Door, or a Junction. 
        These objects have:
            .draw(): a function which actually draws them on the map,
            .visit(): a function which .draw()s visible decendant items on
                      the map, if not already drawn
        The constructor takes the parent item this DT is attached to, then
        figures out any random things (size, features), and where the DT
        should be placed with no overlaps. If nothing can fit, return null,
        and the parent item has to react accordingly (place a wall).
        
        So it's the responsibility of the Calling Object to pass in the
        relationship between the objects. "I'm a Corridor, you're a Junction
        and my END", or "I'm a Door, you're a Corridor to the NORTH of me".
        With that information the DT can calculate it's location.
        */
        this.parent = parent_obj || null;
        this.of_parent = relation || AHQ.options.start_from;
        this.x = 0;       // ALWAYS in "squares", NOT scaled to display
        this.y = 0;       // ALWAYS in "squares", NOT scaled to display
        this.width = 0;   // ALWAYS in "squares", NOT scaled to display
        this.height = 0;  // ALWAYS in "squares", NOT scaled to display
        this.drawn = false;
        this.draw = function(){
            if (AHQ.the_o_g == null){
                AHQ.the_o_g = AHQ.canvas.g(this)
            }
            else{
                AHQ.the_o_g.add(this)
            }
            console.debug('called draw() on a DungeonTile.')
        }
        this.visit = function(){
            console.debug('called visit() on a DungeonTile: ' + this.prototype.constructor.name)
        }
    }
    AHQ.DungeonTile = DungeonTile;

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

    function Hero(){
        AHQ.Mob.call(this)
        this.x = AHQ.options.start_x;
        this.y = AHQ.options.start_y;
    }
    Hero.prototype = Object.create(AHQ.Mob.prototype);
    Hero.prototype.constructor = Hero;
    AHQ.Hero = Hero;

    function JunctionConnector(parent_obj, relation){
        // JunctionConnector is invisible and just lays over the ends of junctions so we can pass through
        // relation is either N,S,E, or W
        // if it's S of parent, then our x is parent_obj.x, our y is parent_obj.y+1
        DungeonTile.call(this, parent_obj, relation);
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
    JunctionConnector.prototype = Object.create(DungeonTile.prototype);
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
        DungeonTile.call(this, parent_obj, relation);
        this.visited = false;
        // Wall/Exit locations
        this.north = this.south = this.east = this.west = 'unknown';
        /* Determine Junction Type, which will tell us what exits we need */
        this.width = 2;
        this.height = 2;
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
        // make placeholders off of each 'unknown' exit.
        // A placeholder must be 7 squares long
        if(this.north == 'unknown'){
            ph_x = this.x;
            ph_y = this.y - 7;
            ph_width = 2;
            ph_height = 7;
            this.north = AHQ.make_placeholder(ph_x,ph_y,ph_width,ph_height, true);
        }
        if(this.south == 'unknown'){
            ph_x = this.x;
            ph_y = this.y + 2;
            ph_width = 2;
            ph_height = 7;
            this.south = AHQ.make_placeholder(ph_x,ph_y,ph_width,ph_height, true);
        }
        if(this.east == 'unknown'){
            ph_x = this.x + 2;
            ph_y = this.y;
            ph_width = 7;
            ph_height = 2;
            this.east = AHQ.make_placeholder(ph_x,ph_y,ph_width,ph_height, true);
        }
        if(this.west == 'unknown'){
            ph_x = this.x - 7;
            ph_y = this.y;
            ph_width = 7;
            ph_height = 2;
            this.west = AHQ.make_placeholder(ph_x,ph_y,ph_width,ph_height, true);
        }
        // Object Methods
        this.draw = function(){
            if(this.drawn){
                return
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
            //console.info(this.g.getBBox())
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
        this.visit = function(){
            /* Generate new corridor for each exit, then immediately draw them */
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
                    }
                } else if (this.north && this.north.constructor.name == 'Corridor'){
                    /* Already have a corridor here, just draw it.*/
                    cnx = new AHQ.JunctionConnector(this, 'n')
                    AHQ.the_map.place_tile(cnx.x, cnx.y, cnx)
                    this.north.draw();
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
                    }
                } else if (this.south && this.south.constructor.name == 'Corridor'){
                    /* Already have a corridor here, just draw it.*/
                    cnx = new AHQ.JunctionConnector(this, 's')
                    AHQ.the_map.place_tile(cnx.x, cnx.y, cnx)
                    this.south.draw();
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
                    };
                } else if (this.east && this.east.constructor.name == 'Corridor'){
                    /* Already have a corridor here, just draw it.*/
                    cnx = new AHQ.JunctionConnector(this, 'e')
                    AHQ.the_map.place_tile(cnx.x, cnx.y, cnx)
                    this.east.draw();
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
                    }
                } else if (this.west && this.west.constructor.name == 'Corridor'){
                    /* Already have a corridor here, just draw it.*/
                    cnx = new AHQ.JunctionConnector(this, 'w')
                    AHQ.the_map.place_tile(cnx.x, cnx.y, cnx)
                    this.west.draw();
                }
                this.visited = true;
            }
            AHQ.bring_doors_to_front();
        }
        this.remove = function(){
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
    }
    Junction.prototype = Object.create(DungeonTile.prototype);
    Junction.prototype.constructor = Junction;
    AHQ.Junction = Junction;





    function Corridor(parent_obj, relation, psg_length){
        /* A Corridor is a DungeonTile which begins and ends with a Junction.
        It can vary in length between 5, 10, or 15 squares. 
        It can have up to 2 Doors along its length (or more, but only 2 from
        the construction), or Wandering Monsters.
        Doors from a Corridor ALWAYS lead to a Room.
          .draw(): will render itself and child Junctions and Doors
          .visit(): does nothing.
        */
        DungeonTile.call(this, parent_obj, relation);
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
    Corridor.prototype = Object.create(DungeonTile.prototype);
    Corridor.prototype.constructor = Corridor;
    AHQ.Corridor = Corridor;






    function Door(parent_obj, relation){
        /* A passage "section" (5 squares) can only have one door, so
        we need to decide on which wall, then determine if that section is
        already taken or not. */
        DungeonTile.call(this, parent_obj, relation);
        // inspect parent and collect 'valid' door locations (all)
        this.valid_locations = []
        this.visited = false;
        
        if(this.parent.constructor == AHQ.Corridor){
            // this.parent is the corridor - of_parent will tell us direction of
            // the corridor. N/S corridor can only have doors on E or W wall, etc
            if(this.parent.of_parent == 'n' || this.parent.of_parent == 's'){
                for(x = this.parent.height-1; x >= 0; x--){
                    this.valid_locations.push('e_'+x);
                    this.valid_locations.push('w_'+x);
                }
            } else {
                for(x = this.parent.width-1; x >= 0; x--){
                    this.valid_locations.push('n_'+x);
                    this.valid_locations.push('s_'+x);
                }
            }
        } else if (this.parent.constructor == AHQ.Room){
            // Room.of_parent tells us which wall will already have a door in it
            //   'n' means the south wall, 'e' means the west wall, 
            //   's' means the north wall, 'w' means the east wall
            switch(this.parent.of_parent){
                case 'n':
                    for(x = this.parent.width-1; x >= 0; x--){
                        this.valid_locations.push('n_'+x);
                    }
                    for(x = this.parent.height-1; x >= 0; x--){
                        this.valid_locations.push('e_'+x);
                        this.valid_locations.push('w_'+x);
                    }
                    break;
                case 'e':
                    for(x = this.parent.width-1; x >= 0; x--){
                        this.valid_locations.push('n_'+x);
                        this.valid_locations.push('s_'+x);
                    }
                    for(x = this.parent.height-1; x >= 0; x--){
                        this.valid_locations.push('e_'+x);
                    }
                    break;
                case 's':
                    for(x = this.parent.width-1; x >= 0; x--){
                        this.valid_locations.push('s_'+x);
                    }
                    for(x = this.parent.height-1; x >= 0; x--){
                        this.valid_locations.push('e_'+x);
                        this.valid_locations.push('w_'+x);
                    }
                    break;
                case 'w':
                    for(x = this.parent.width-1; x >= 0; x--){
                        this.valid_locations.push('n_'+x);
                        this.valid_locations.push('s_'+x);
                    }
                    for(x = this.parent.height-1; x >= 0; x--){
                        this.valid_locations.push('w_'+x);
                    }
                    break;
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
                    this.room_ph_y = this.parent.y + 2;
                    this.room_ph_width = width;
                    this.room_ph_height = height;
                    break;
                case 'e':
                    this.room_ph_x = this.parent.x + 2;
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
                    //this.valid_locations.splice(this.valid_locations.indexOf(door_location),1)
                    //door_location = null;
                    //console.debug('Fitting a room behind door at ' + door_location )
                    it_fits = false
                } else {
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
            this.chosen_loc = this.place_room_beyond(AHQ.choose(this.valid_locations), 5, 5)
        }
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
                while(placement_attempts >= 0){
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
                // loop 10 times testing placement
                // if it fits, we're done. if not, remove the door
                this.visited = true;
            }
        }
        this.remove = function(){}
    }
    Door.prototype = Object.create(DungeonTile.prototype);
    Door.prototype.constructor = Door;
    AHQ.Door = Door;






    function Room(parent_obj, relation, x, y, w, h, room_type){
        DungeonTile.call(this, parent_obj, relation);
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
    Room.prototype = Object.create(DungeonTile.prototype);
    Room.prototype.constructor = Room;
    AHQ.Room = Room;
    
    function TileSpace(width, height){
        this.width = width;
        this.height = height;
        this.__data__ = Array(this.width * this.height)
        this.push = function(x, y, val){
            // push the val into stack at position (x,y)
            // Each item is a stack/array - initially undefined
            if(x>this.width-1 || x<0 
                || y>this.height-1 || y<0){
                return undefined
            }
            p = (this.width * y) + x
            if(this.__data__[p] === undefined){
                this.__data__[p] = [val]
            } else {
                this.__data__[p].push(val);
            }
            return this.__data__[p]
        }
        this.set = function(x, y, val){
            // set the val at position (x,y) overwriting the stack
            if(x>this.width-1 || x<0 
                || y>this.height-1 || y<0){
                return undefined
            }
            p = (this.width * y) + x
            this.__data__[p] = val
            return this.__data__[p]
        }
        this.place_tile = function(x, y, tile){
            // place a tile - x,y is top-right corner of the BOUNDING BOX of the tile
            // *** NO CHECKING!!! *** This function does NOT check if it's valid to place
            // a tile here - that logic should live elsewhere
            if( tile instanceof AHQ.DungeonTile == false){
                console.error(tile)
                throw TypeError('place_tile requires a DungeonTile as argument');
            }
            if(x>this.width-1 || x<0 
                || y>this.height-1 || y<0){
                //throw RangeError('Position (' + x + ', ' + y + ') is Off Map!')
                console.debug('Position (' + x + ', ' + y + ') is Off Map!')
                return
            }
            if(x+tile.width-1 > this.width-1 || y+tile.height-1 > this.height-1){
                //throw RangeError('Tile of size ' + tile.width + 'x' + tile.height + ' does not fit on map at '
                //                 + '(' + x + ',' + y + ')')
                console.debug(('Tile of size ' + tile.width + 'x' + tile.height + ' does not fit on map at '
                                 + '(' + x + ',' + y + ')'))
                return
            }
            // tile should fit, so loop through tile width and height, pushing tile onto stack
            for(this_y = y; this_y < y+tile.height; this_y++){
                for(this_x = x; this_x < x+tile.width; this_x++){
                    this.push(this_x, this_y, tile)
                }
            }
        }
        this.get = function(x, y){
            if(x>this.width-1 || x<0 
                || y>this.height-1 || y<0){
                return undefined
            }
            return this.__data__[(this.width * y) + x]
        }
        this.get_section = function(x, y, w, h){
            // Returns a subsection of this.__data__ starting at x,y, with the given width and height
            // if the requested section runs off the edge of this.__data__, those positions will
            // be populated with [false] (undefined would mean it's available)
            new_ts = new TileSpace(w,h)
            for(y2 = y; y2 < y+h; y2++){
                // y2 is current loc in __data__
                console.debug('y2 is now ' + y2)
                for(x2 = x; x2 < x+w; x2++){
                    console.debug('x2 is now ' + x2)
                    if(x2>=this.width || y2 >= this.height){
                        // off map, give false
                        new_ts.set(x2-x, y2-y, false)
                    } else {
                        new_ts.set(x2-x, y2-y, this.get(x2, y2))
                    }
                }
            }
            return new_ts
        }
        this.can_move_to = function(mob, target_x, target_y){
            // mob is anything that can move (hero, NPC, or monster)
            // target_x, target_y is where they want to move TO
            // the mob will have its own (x,y) which we will inspect
            // assert x-1 == target_x || x+1 == target_x || x == target_x
            // assert y-1 == target_y || y+1 == target_y || y == target_y
            // target_x,target_y must have a tile in stack
            // target_x,target_y and mob.x,mob.y must have SAME time in stack
            // target_x,target_y must NOT have a mob in stack
            //console.debug('can_move_to called with mob.x: ' + mob.x + ', mob.y: ' + mob.y + ', target_x: ' + target_x + ' target_y: ' + target_y)
            if( mob instanceof AHQ.Mob == false){
                console.error(mob)
                throw TypeError('can_move_to requires a Mob as argument');
            }
            if( ! ((mob.x-1 == target_x || mob.x+1 == target_x || mob.x == target_x) &&
                   (mob.y-1 == target_y || mob.y+1 == target_y || mob.y == target_y))) {
                console.error(mob)
                console.error('Moving too far - target is(' + target_x + ', ' + target_y + ')')
                return false
            }
            if( target_x < 0 || target_x > this.width+1 || target_y < 0 || target_y > this.height+1){
                console.error(mob)
                console.error('Off-Map - target is(' + target_x + ', ' + target_y + ')')
                return false
            }
            // loop through all items in stack at target position. Check if DungeonTiles are ALSO
            // in mobs current position stack. If any item is another mob, can't move there.
            target = this.get(target_x, target_y)
            current_pos = this.get(mob.x, mob.y)
            if(target){
                // target can be undefined or false
                for(i=0; i<target.length; i++){
                    obj = target[i]
                    if(obj instanceof AHQ.Mob){
                        // cannot move onto other mobs
                        return false;
                    }
                    if(obj instanceof AHQ.DungeonTile){
                        // If this tile is also in the current position, we're good to go there
                        if(current_pos.includes(obj)){
                            return true;
                        }
                    }
                }
                return false;
            } else {
                return false
            }
        }
        this.delete = function(){
            // if we have a section of a larger TileSpace, then we could have a bunch of references
            // to the same stack objects, which.. I guess is fine? They all point to the same things
            // but just in case we're done with a section, delete it. Maybe it'll help?
            delete this.__data__
            delete this.width
            delete this.height
        }
        this.demo = function(){
            for(y=0; y<this.height; y++){
                console.debug('y is now ' + y)
                for(x=0; x<this.width; x++){
                    console.debug('x is now ' + x)
                    this.push(x,y, '(' + x + ', ' + y + ')');
                }
            }
        }
    }
    AHQ.TileSpace = TileSpace

    $(function(){
        var s = Snap("#svg");
        AHQ.canvas = s;
        s.attr({ viewBox: "0 0 "+AHQ.options.max_x*AHQ.options.scale+" "+AHQ.options.max_y*AHQ.options.scale});
        AHQ.the_map = new AHQ.TileSpace(AHQ.options.max_x, AHQ.options.max_y)
        dungeon_entry = new AHQ.Junction()
        dungeon_entry.south.remove();
        dungeon_entry.draw();
        entry_corridor = new AHQ.Corridor(dungeon_entry, 's', 10)
        entry_corridor.end.remove();
        corridor_end = new AHQ.Junction(entry_corridor, 's', 't')
        ragnar = new AHQ.Hero();
        ragnar.draw();
        dungeon_entry.visit();

        //AHQ.the_o_g.animate({ transform:'translate(300,100)'}, 700, mina.bounce);
        keys = {97:'a',119:'w',115:'s', 100:'d',
                65:'A',87:'W',83:'S', 68:'D',}
        $("body").keypress(function(event){
            key = keys[event.which];
            switch(key.toUpperCase()){
            case 'W':
                ragnar.move(0, -1);
                break;
            case 'S':
                ragnar.move(0, 1)
                break;
            case 'D':
                ragnar.move(1, 0)
                break;
            case 'A':
                ragnar.move(-1, 0)
                break;
            case 'w':
                ragnar.move(0, -1)
                ragnar.move(0, -1)
                ragnar.move(0, -1)
                ragnar.move(0, -1)
                ragnar.move(0, -1)
                break;
            case 's':
                ragnar.move(0, 1)
                ragnar.move(0, 1)
                ragnar.move(0, 1)
                ragnar.move(0, 1)
                ragnar.move(0, 1)
                break;
            case 'd':
                ragnar.move(1, 0)
                ragnar.move(1, 0)
                ragnar.move(1, 0)
                ragnar.move(1, 0)
                ragnar.move(1, 0)
                break;
            case 'a':
                ragnar.move(-1, 0)
                ragnar.move(-1, 0)
                ragnar.move(-1, 0)
                ragnar.move(-1, 0)
                ragnar.move(-1, 0)
                break;
            }
        })
    })
    
function Super(){
    this.val = 1
}
Super.prototype.method = function(){
    console.debug('Super.method() was called')
}

function Sub(){
    this.val = 2
    Super.call(this)
}
Sub.prototype = Object.create(Super.prototype);
Sub.prototype.method = function(){
    console.info(Object.getPrototypeOf(Sub.prototype).method.call(this))
    console.debug('Sub.method() was called')
}
Sub.prototype.constructor = Sub;
    </script>
</html>