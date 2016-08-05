// Name: Indri Himawan
// Completed on April 1st, 2016
// CS 4395 - Project 2 (gasket2.js)

var canvas;
var gl;


var points = [];

var NumTimesToSubdivide = 1;
var maxTimes = 11;
var halt = false;
var generating = false;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // First, initialize the corners of our gasket with three points.
    
    var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];

    divideTriangle( vertices[0], vertices[1], vertices[2],
                    NumTimesToSubdivide);

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

	canvas.addEventListener("mousedown", function(event){

		if (event.which == 1 && !generating && NumTimesToSubdivide < maxTimes){ //left click
		
			generating = true;
			halt = false;
			document.getElementById("status").innerHTML = "Status: Generating new points";
			subdivide();
		
			(function theLoop () {
  				setTimeout(function () {
    					if (!halt){
							subdivide();
    						if (NumTimesToSubdivide<maxTimes) {          
      							theLoop(NumTimesToSubdivide); 
    						}else if (NumTimesToSubdivide >= maxTimes){
    							document.getElementById("status").innerHTML = "Status: Max subdivision count reached. Please Terminate/Reset.";
    						}
    				}
  				}, 1000);
			})();

		}else if (event.which == 2){ //middle click
			generating = false;
			NumTimesToSubdivide = 1;
			document.getElementById("count").innerHTML="Subdivision count: 1";
			document.getElementById("status").innerHTML = "Status: Terminated/Reset";
			points = [];
		    divideTriangle( vertices[0], vertices[1], vertices[2], NumTimesToSubdivide);
            gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
            render();
            halt = true;
            
		}else if (event.which == 3 && NumTimesToSubdivide < maxTimes){ //right click
			generating = false;
			document.getElementById("status").innerHTML = "Status: Halt";
			halt = true;
			
		}

    } );
    
    function subdivide(){
    	document.getElementById("count").innerHTML="Subdivision count: " + ++NumTimesToSubdivide;
		points = [];
		divideTriangle( vertices[0], vertices[1], vertices[2], NumTimesToSubdivide);
    	gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    	render();
    }
    
    canvas.addEventListener("contextmenu", function(event){
		event.preventDefault();
    }, false );

    render();
};

function doAdelay()
{
	setTimeout(function(){
		return true;
	},500);

}

function triangle( a, b, c )
{
    points.push( a, b, c );
}

function divideTriangle( a, b, c, count )
{

    // check for end of recursion
    
    if ( count == 0 ) {
    
        triangle( a, b, c );
    }
    
    else {
    
        //bisect the sides
        
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles
        
        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}

