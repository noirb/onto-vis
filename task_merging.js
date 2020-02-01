
// provides a mapping between activity labels and definitions (i.e. the actual InHand/ActedOn properties)
function ActivityMap()
{
    this.activities = {};

    // returns True if the given activity definition exists in the map
    this.has = function( activity )
    {
        return Object.keys(this.activities).includes( activity );
    }

    // adds name to the entry for activity in the map.
    // If activity is not in the map, it will be added.
    this.add = function( name, activity )
    {
        if( !this.has(activity) )
        {
            this.activities[activity] = [ name ];
        }
        else
        {
            if( !this.activities[activity].includes(name) )
                this.activities[activity].unshift(name);
        }
    }

    // given an activity name, returns the common name for that activity
    // (used to merge activity knowledge which used different labels)
    this.map = function( name )
    {
        if( name.indexOf(' ') != -1)
        {
            var actparams = name.substr(name.indexOf(' ')+1);
            if( !this.has( actparams ) )
                return name;
            else
                return this.activities[actparams][0];
        }
        else
        {
            return name;
        }
        
    }

    // given an activity name, returns the corresponding activity definition
    this.get = function( name )
    {
        console.log('checking ' + name);
        for( var activity in this.activities )
        {
            for( i in this.activities[activity] )
            {   
                if( name == this.activities[activity][i] )
                    return activity;
            }
        }
        return '';
    }

    // returns the number of activity definitions stored in the map
    this.length = function() { return Object.keys(this.activities).length; }

    // generates a printable representation of the map
    this.toString = function()
    {
        var out = '';
        var actions = Object.keys(this.activities);
        for( var i = 0; i < actions.length; i++ )
        {
            out += this.activities[actions[i]][0] + ' ' + actions[i] + '\n';
        }
        return out;
    }
}

// adds the activity data from activities_txt to the (existing) ActivityMap, map
function addToActivityMap( activities_txt, map )
{
    var lines = activities_txt.split('\n').filter(String);
    var log = [];

    lines.forEach( function( line ) {
        var act = parseActivityParams( line );
        if( act != null )
        {
            map.add( act.name, act.params );
        }
    });

    return map;
}

// parses one activity definition
function parseActivityParams( line )
{
    var rActParams = /(\S+) (.*)/;
    var res = rActParams.exec( line );
    if( res != null )
    {
        return {
            name: res[1],
            params: res[2]
        };
    }
}

// parses txt-formatted task graph output from onto_agent (NOT .bag results)
// extracts complete activity descriptions
function parseTaskGraph2( log_txt )
{
    var lines = log_txt.split('\n').filter(String);
    var log = [];
    
    var rNode     = /nodes\[([0-9]+)\]:/;
    var rName     = /name: (.+)/;
    var rNeighbor = /neighbors\[[0-9]+\]: (.+)/;
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