/*
    Functions for constructing & updating plots
    
    Requires Plot.ly
*/

// Force the plot in the given container to update
function update_plot( container, data, layout )
{
    Plotly.plot(container, data, layout);
}

// Constructs a line trace for drawing data in a plot
function make_lineTrace( name, color )
{
    var trace = {
        x: [],
        y: [],
        type: 'scatter',
        name: name,
        line: {
            color: color,
            width: 1,
            shape: 'spline'
        },
        shiftIfLonger( max_size ) {
            if (this.x.length > max_size)
                this.x.shift();
            if (this.y.length > max_size)
                this.y.shift();
        }
    };
    return trace;
}

// Constructs a plot accepting 3D velocity values
function make_velocityPlot( buffersize )
{
    var plot = {
        traces : {
            x : make_lineTrace('x vel', 'rgb(128, 12, 12)'),
            y : make_lineTrace('y vel', 'rgb(12, 128, 12)'),
            z : make_lineTrace('z vel', 'rgb(12, 12, 128)')
        },
        max_size : buffersize,
        push : function( time, velocity ) {
            // add new data to traces
            this.traces.x.x.push(time);
            this.traces.y.x.push(time);
            this.traces.z.x.push(time);

            this.traces.x.y.push(velocity.x);
            this.traces.y.y.push(velocity.y);
            this.traces.z.y.push(velocity.z);

            // shift oldest data point out of traces if they're longer than max size
            this.traces.x.shiftIfLonger( this.max_size );
            this.traces.y.shiftIfLonger( this.max_size );
            this.traces.z.shiftIfLonger( this.max_size );
        },
        getData : function() {
            return [{'x':this.traces.x, 'y':this.traces.y, 'z':this.traces.z}];
        }
    };

    return plot;
}

// Constructs a plot accepting 3D position values
function make_positionPlot( buffersize )
{
    var plot = {
        traces : {
            x : make_lineTrace('x pos', 'rgb(128, 12, 12)'),
            y : make_lineTrace('y pos', 'rgb(12, 128, 12)'),
            z : make_lineTrace('z pos', 'rgb(12, 12, 128)')
        },
        max_size : buffersize,
        push : function( time, position ) {
            // add new data to traces
            this.traces.x.x.push(time);
            this.traces.y.x.push(time);
            this.traces.z.x.push(time);

            this.traces.x.y.push(position.x);
            this.traces.y.y.push(position.y);
            this.traces.z.y.push(position.z);

            // shift oldest data point out of traces if they're longer than max size
            this.traces.x.shiftIfLonger( this.max_size );
            this.traces.y.shiftIfLonger( this.max_size );
            this.traces.z.shiftIfLonger( this.max_size );
        },
        getData : function() {
            return [{'x':this.traces.x, 'y':this.traces.y, 'z':this.traces.z}];
        }
    };
    
    return plot;
}