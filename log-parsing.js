/*
    Helper functions for parsing & processing log data
*/

// describes the hand state for one motion segment
function MotionSegment()
{
  this.effector = "";
  this.start    = 0.0;
  this.end      = 0.0;
  this.moving   = false;
  this.tool_use = false;
  this.actedOn  = "";
  this.inHand   = "";
  this.activity = "";

  this.duration = function() { return this.end - this.start; }
}

// a list of MotionSegments
function MotionLog()
{
  this.log = [];

  this.append = function( entry ) { this.log.push( entry ); }
  this.last   = function() { return this.log[this.log.length - 1]; }
  this.length = function() { return this.log.length; }
  this.at     = function( time )
                  {
                      for( var i = 0; i < this.log.length; i++)
                      {
                          if( this.log[i].start < time && this.log[i].end > time )
                              return this.log[i];
                      }
                      return null;
                  }
}

// A list of sequential activities
function ActivityLog( name )
{
    this.activityName = name;
    this.inHand       = [];
    this.actedOn      = [];
}

// Information stored at each node of the TaskGraph
function TaskGraphNode()
{
    this.name      = '';
    this.neighbors = [];
    this.weights   = [];
}

// parses one individual motion segment entry from a log file
// returns a MotionSegment object
function parseMotionSegment( segment )
{
  var entries = segment.split(', ');

  if ( entries.length != 8 )
      return null;

  var s = new MotionSegment();
  s.effector = entries[0];
  s.start    = parseFloat( entries[1] );
  s.end      = parseFloat( entries[2] );
  s.moving   = (entries[3] == 'moving');
  s.tool_use = (entries[4] == 'tool_use');
  s.actedOn  = entries[5];
  s.inHand   = entries[6];
  s.activity = entries[7];

  return s;
}

// parses a motion log
// returns a MotionLog object
// log is assumed to be a string
function parseMotionLog( log_txt )
{
  var log = new MotionLog();

  var lines = log_txt.split('\n');
  lines.forEach( function( line ) {
     if( line[0] == '#' || line.startsWith('effector_name') )
         return;

     var next_entry = parseMotionSegment( line );
     if( next_entry != null )
        log.append( next_entry );
  });

  return log;
}

// parses activity info from onto_agent logs
function parseActivityLog( log_txt )
{
    var log = [];
    var lines = log_txt.split('\n').filter(String);
    lines.forEach( function( entry ) {
        var tokens = entry.split(' ').filter(String);
        var activity = new ActivityLog( tokens[0] );

        var currProp = '';
        for (var i = 1; i < tokens.length; i++)
        {
            switch( tokens[i] )
            {
                case 'inHand':
                    currProp = tokens[i];
                    break;
                case 'actedOn':
                    currProp = tokens[i];
                    break;
                case '{':
                    break;
                case '}':
                    currProp = '';
                    break;
                case '(':
                    break;
                case ')':
                    break;
                case 'IsSubclassOf':
                    break;
                case 'IsNotSubclassOf':
                    break;
                case 'HasValue':
                    break;
                case 'DoesNotHaveValue':
                    break;
                case 'IsClass':
                    break;
                case 'IsNotClass':
                    break;
                default:
                    if( currProp == 'inHand' )
                        activity.inHand.push( tokens[i].replace(',', '') );
                    else if( currProp == 'actedOn' )
                        activity.actedOn.push( tokens[i].replace(',', '') );
            }
        }
        log.push( activity );
    });

    return log;
}

// parses txt-formatted task graph output from onto_agent (NOT .bag results)
function parseTaskGraph( log_txt )
{
    var lines = log_txt.split('\n').filter(String);
    var log = [];
    
    var rNode     = /nodes\[([0-9]+)\]:/;
    var rName     = /name: (\S+)/;
    var rNeighbor = /neighbors\[[0-9]+\]: (\S+)/;
    var rWeight   = /weights\[[0-9]+\]: (\S+)/;

    var curNode = null;
    var curNode_idx = -1;
    lines.forEach( function( n ) {
        // is this the start of a new node declaration?
        var res = rNode.exec( n );
        if( res != null )
        {
            if( curNode != null ) // we parsed a node before this
            {
                log.push( curNode );
                curNode = null;
            }

            curNode = new TaskGraphNode();
            curNode_idx = res[1];
            return;
        }

        // is this the node's name?
        res = rName.exec( n );
        if( res != null )
        {
            curNode.name = res[1];
            return;
        }

        // is this a neighbor entry?
        res = rNeighbor.exec( n );
        if( res != null )
        {
            curNode.neighbors.push( res[1] );
            return;
        }

        // is this an edge weight entry?
        res = rWeight.exec( n );
        if( res != null )
        {
            curNode.weights.push( parseFloat( res[1] ) );
            return;
        }
    });

    // we may have one last node we haven't pushed yet
    if( curNode != null )
    {
        log.push( curNode );
    }

    return log;
}

// parses JSON-formatted simulation logs (from the Unity side)
function parseSimulationLog( log_txt )
{
    var log = null;
    try {
        log = JSON.parse( log_txt );
    }
    catch ( e ) {
        console.log('ERROR: Failed to parse simulation log\n', e);
        return null;
    }

    var objlog = {};

    log.log.forEach( function( entry ) {
       entry.logstep.forEach( function( obj ) {
         if ( !(obj.name in objlog) )
           objlog[obj.name] = [];

         objlog[obj.name].push({
            time:        entry.time,
            position:    obj.position,
            orientation: obj.orientation,
            velocity:    obj.velocity,
            events:      obj.events
         });
       });
    });
    objlog.size     = function()       { return Object.keys(this).length; }
    objlog.contains = function( name ) { return Object.keys(this).includes( name ); }
    return objlog;
}