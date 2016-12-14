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
    <script src="/static/js/ahq/ahq.js"></script>
    <script src="/static/js/ahq/ahq.junctions.js"></script>
    <script src="/static/js/ahq/ahq.corridors.js"></script>
    <script src="/static/js/ahq/ahq.doors.js"></script>
    <script src="/static/js/ahq/ahq.rooms.js"></script>
    <script src="/static/js/ahq/ahq.mobs.js"></script>
    <script src="/static/js/ahq/ahq.heroes.js"></script>
    <script>
    

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