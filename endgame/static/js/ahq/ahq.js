
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
    },
    TileSpace: function(width, height){
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
        this.delete_tile = function(tile){
            stack = this.get(tile.x, tile.y)
            if(stack.indexOf(tile) >= 0){
                stack.splice(stack.indexOf(tile),1)
            }
        }
        this.get_section = function(x, y, w, h){
            // Returns a subsection of this.__data__ starting at x,y, with the given width and height
            // if the requested section runs off the edge of this.__data__, those positions will
            // be populated with false (undefined would mean it's available)
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
        this.printmap = function(){
            s = ''
            for(j=0; j<this.height; j++){
                for(i=0; i<this.width; i++){
                    item = this.get(i,j)
                    if(item){
                        if(item[0] instanceof AHQ.Room){
                            s += 'R'
                        } else if(item[0] instanceof AHQ.Corridor || item[0] instanceof AHQ.Junction){
                            s += 'C'
                        } else if(item[0] instanceof AHQ.Door) {
                            s += 'D'
                        } else {
                            s += 'C'
                        }
                    } else {
                        s += ' '
                    }
                }
                s += '\n'
            }
            return s
        }
    },
    DungeonTile: function(parent_obj, relation){
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
};


