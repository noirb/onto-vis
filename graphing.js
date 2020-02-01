
function TaskGraphLayout( graph )
{
    if( graph )
    {
        // get max weight of all edges
        var max_edge_weight = 1;
        var edges = graph.elements('edge[*]');
        edges.forEach( function( e )
        {
            if( e.data('weight') > max_edge_weight )
                max_edge_weight = e.data('weight');
        });
        
        return {
            name: 'cose',
            ready: function(){},
            stop: function(){},
            animate: true,
            fit: true,
            padding: 30,
            boundingBox: undefined,
            randomize: true,
            componentSpacing: 100,
            nodeRepulsion: function( node ){
                var total_weight = 0;
                node.connectedEdges().forEach( function( edge ) {
                    total_weight += edge.data('weight');
                });
                return 4500 * node.degree(); // (total_weight / max_edge_weight);
            },
            nodeOverlap: 10000,
            idealEdgeLength: function( edge ){ return edge.data('weight'); },
            edgeElasticity: function( edge ){ return edge.data('weight') / (0.5*max_edge_weight); },
            nestingFactor: 0.5,
            gravity: 0.4,
            numIter: 7500,
            initialTemp: 600,
            coolingFactor: 0.95,
            minTemp: 1.0,
            useMultitasking: true
        };
    }
    else
    {
        return {
            name: 'cose',
            ready: function(){},
            stop: function(){},
            animate: true,
            fit: true,
            padding: 30,
            boundingBox: undefined,
            randomize: true,
            componentSpacing: 100,
            nodeRepulsion: function( node ){
                var total_weight = 0;
                node.connectedEdges().forEach( function( edge ) {
                    total_weight += edge.data('weight');
                });
                return 4500 * node.degree(); // (total_weight / max_edge_weight);
            },
            nodeOverlap: 10000,
            idealEdgeLength: function( edge ){ return edge.data('weight'); },
            edgeElasticity: function( edge ){ return edge.data('weight') / 5; },
            nestingFactor: 0.5,
            gravity: 0.4,
            numIter: 7500,
            initialTemp: 600,
            coolingFactor: 0.95,
            minTemp: 1.0,
            useMultitasking: true
        };
    }
}

function TaskGraph( container, nodes, edges )
{
    var max_edge_weight = 1;
    edges.forEach( function( e ) {
        if( e.data.weight > max_edge_weight )
            max_edge_weight = e.data.weight;
    });

    return cytoscape({
    container: container,
                
                elements: {
                    nodes: nodes,
                    edges: edges
                },

                style: [
                    {
                        selector: 'node',
                        style: {
                            'background-color': 'mapData(outdegree, 0, 20, DarkSlateGray, FireBrick)', //'#666',
                            'label' : 'data(id)',
                            'color': 'white',
                            'text-valign': 'center',
                            'text-outline-width': 2,
                            'text-outline-color': 'DarkSlateGray'
                        }
                    },
                    {
                        selector: 'edge',
                        style: {
                            'label':'data(weight)',
                            'text-valign':'top',
                            'text-outline-width' : 1,
                            'color' : 'white',
                            'width': 3,
                            'line-color': 'mapData(weight, 0, ' + max_edge_weight.toString() + ', DarkSlateGray, OrangeRed)',
                            'mid-target-arrow-color': '#e23b22',
                            'mid-target-arrow-shape': 'triangle',
                            'end-target-arrow-shape': 'triangle',
                            'curve-style': 'bezier',
                            'control-point-step-size': 40
                        }
                    }
                ],

                layout: {
                    name: 'cose',
                    ready: function(){},
                    stop: function(){},
                    animate: true,
                    fit: true,
                    padding: 30,
                    boundingBox: undefined,
                    randomize: true,
                    componentSpacing: 100,
                    nodeRepulsion: function( node ){
                        var total_weight = 0;
                        node.connectedEdges().forEach( function( edge ) {
                            total_weight += edge.data('weight');
                        });
                        return 4500 * node.degree(); // (total_weight / max_edge_weight);
                    },
                    nodeOverlap: 10000,
                    idealEdgeLength: function( edge ){ return edge.data('weight'); },
                    edgeElasticity: function( edge ){ return edge.data('weight') / (0.5*max_edge_weight); },
                    nestingFactor: 0.5,
                    gravity: 0.4,
                    numIter: 7500,
                    initialTemp: 600,
                    coolingFactor: 0.95,
                    minTemp: 1.0,
                    useMultitasking: true
                    
                    /* COLA LAYOUT
                    name: 'cola',
                    animate: true,
                    refresh: 1,
                    maxSimulationTime: 4000,
                    ungrabifyWhileSimulating: false,
                    fit: true,
                    padding: 30,
                    boundingBox: undefined,
                    ready: function(){},
                    stop: function(){},
                    randomize: true,
                    avoidOverlap: true,
                    handleDisconnected: true,
                    nodeSpacing: function( node ){
                        var total_weight = 0.0;
                        node.connectedEdges().forEach( function( edge ) {
                            total_weight += edge.data('weight');
                        });
                        return 100 * total_weight / (node.degree()*max_edge_weight) + 50;
                    },
                    flow: undefined,
                    alignment: undefined,
                    edgeLength: undefined,
                    edgeSymDiffLength: undefined,
                    edgeJaccardLength: undefined,
                    unconstrIter: undefined,
                    userConstIter: undefined,
                    allConstIter: undefined,
                    infinite: false
                    */
                },

                wheelSensitivity: 0.02
    });
}

function pruneEdges( graph, min_weight )
{
    graph.remove('edge[weight <= ' + min_weight + ']');
    graph.remove('node[[degree < 1]]');
    return graph;
}

function saveGraph( graph, activityMap )
{
    var indent = '  ';
    var output = 'nodes[]\n';

    if( !graph )
        return output;

    var nodes = graph.elements('node'); // get all nodes
    for( var i = 0; i < nodes.length; i++ )
    {
        output += indent + "nodes[" + i + "]:\n"; // new node declaration
        output += indent + "name: " + nodes[i].data('id') + " " + activityMap.get(nodes[i].data('id')) + "\n";
        var edges = graph.elements('edge[source = "' + nodes[i].data('id') + '"]');

        output += indent + "neighbors[]\n";
        for( var j = 0; j < edges.length; j++ )
        {
            output += indent + indent + "neighbors[" + j + "]: " + edges[j].data('target') + " " +
                      activityMap.get(edges[j].data('target')) + "\n";
        }

        output += indent + "weights[]\n";
        for( var j = 0; j < edges.length; j++ )
        {
            output += indent + indent + "weights[" + j + "]: " + edges[j].data('weight') + "\n";
        }
    }

    return output;
}
