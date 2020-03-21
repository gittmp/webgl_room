//Current scene:
//  rainbow 5x5 floor made from one square plane through y=0
//  perspective looking at origin 


const VSHADER_SOURCE = 
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Colour;\n' +

    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_ProjMatrix;\n' +
    'uniform mat4 u_ViewMatrix;\n' +
    
    'varying lowp vec4 u_Colour;\n' +

    'void main(){\n' +
    '   gl_Position = u_ProjMatrix * u_ModelMatrix * u_ViewMatrix * a_Position;\n' +
    '   u_Colour = a_Colour;\n' +
    '}\n';


const FSHADER_SOURCE = 
    'varying lowp vec4 u_Colour;\n' +

    'void main(){\n' +
    '   gl_FragColor = u_Colour;\n' +
    '}\n';

function main(){
    const canvas = document.getElementById('wglCanvas');

    //initialise a webGL rendering context
    const gl = canvas.getContext('webgl');
    if(gl == null){
        alert("Error: unable to initialise webGL context!");
        return;
    }

    //initialise shaders into a shader program
    const shaderProgram = initShaderProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    
    //specify information data about program aspects which we can access when needed
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            u_Position: gl.getAttribLocation(shaderProgram, 'a_Position'),
            u_Colour: gl.getAttribLocation(shaderProgram, 'a_Colour'),
        },
        uniformLocations: {
            projMatrix: gl.getUniformLocation(shaderProgram, 'u_ProjMatrix'),
            modelMatrix: gl.getUniformLocation(shaderProgram, 'u_ModelMatrix'),
            viewMatrix: gl.getUniformLocation(shaderProgram, 'u_ViewMatrix'),
        },
    }

    gl.useProgram(programInfo.program);

    //initialise camera move parameters
    var lookAtParams = {
        step: 0.1,
        ex: 10.0,
        ey: 3.1,
        ez: 10.0,
        lx: 0.0,
        ly: 0.5,
        lz: 0.0,    
    }

    //initialise vertex buffer
    const buffers = initBuffers(gl);

    //moving camera on arrow key press
    document.onkeydown = function(ev){
        keypress(ev, lookAtParams, gl, canvas, programInfo, buffers, lookAtParams);
    };

    document.getElementById("coordinates").innerHTML = `Eye position: (${lookAtParams.ex.toFixed(1)}, ${lookAtParams.ey.toFixed(1)}, ${lookAtParams.ez.toFixed(1)})
                                                        Looking at: (${lookAtParams.lx.toFixed(1)}, ${lookAtParams.ly.toFixed(1)}, ${lookAtParams.lz.toFixed(1)})`; 

    draw(gl, canvas, programInfo, buffers, lookAtParams);

}

//function to move camera when key pressed
function keypress(ev, lookAtParams, gl, canvas, programInfo, buffers, lookAtParams){
    switch (ev.keyCode) {
        case 38: //up arrow
            lookAtParams.ly += lookAtParams.step;
            break;
        case 40: //down arrow
            lookAtParams.ly -= lookAtParams.step;
            break;
        case 39: //right arrow
            lookAtParams.lx += lookAtParams.step;
            break;
        case 37: //left arrow
            lookAtParams.lx -= lookAtParams.step;
            break;

        case 87: //w - increase up y axes
            lookAtParams.ey += lookAtParams.step;
            break;
        case 83: //s - decrease down y axes
            lookAtParams.ey -= lookAtParams.step;
            break;
        case 65: //a - decrease x axes
            lookAtParams.ex -= lookAtParams.step;
            break;
        case 68: //d - increase x axes
            lookAtParams.ex += lookAtParams.step;
            break;
        case 88: //z - decrease z axes
            lookAtParams.ez -= lookAtParams.step;
            break;
        case 90: //x - increase z axes
            lookAtParams.ez += lookAtParams.step;
        default:
            break;
    }

    document.getElementById("coordinates").innerHTML = `Eye position: (${lookAtParams.ex.toFixed(1)}, ${lookAtParams.ey.toFixed(1)}, ${lookAtParams.ez.toFixed(1)})
                                                        Looking at: (${lookAtParams.lx.toFixed(1)}, ${lookAtParams.ly.toFixed(1)}, ${lookAtParams.lz.toFixed(1)})`; 
    draw(gl, canvas, programInfo, buffers, lookAtParams);
}

//initiate a buffer to hold vertex positions
function initBuffers(gl){

    //create an array of vertex positions (e.g. for a square)
    const roomVertices = new Float32Array([
        0.0, 0.0, 0.0, //0
        6.0, 0.0, 0.0, //1
        0.0, 0.0, 6.0, //2
        6.0, 0.0, 6.0, //3

        0.0, 4.0, 0.0, //4
        0.0, 4.0, 6.0, //5
        0.0, 0.0, 0.0, //6
        0.0, 0.0, 6.0, //7

        0.0, 0.0, 0.0, //8
        6.0, 0.0, 0.0, //9
        0.0, 4.0, 0.0, //10
        6.0, 4.0, 0.0, //11

        0.0, 4.0, 0.0, //12
        6.0, 4.0, 0.0, //13
        0.0, 4.0, 6.0, //14
        6.0, 4.0, 6.0, //15

        //v1-v2-v6-v7 => 16, 17, 18, 19
        0.0,0.0001,0.0,  0.0,0.0001,1.5,  1.5,0.0001,0.0,  1.5,0.0001,1.5,
        //v3-v4-v8-v9 => 20, 21, 22, 23
        0.0,0.0001,3.0,  0.0,0.0001,4.5,  1.5,0.0001,3.0,  1.5,0.0001,4.5,
        //v7-v8-v12-v13 => 24, 25, 26, 27
        1.5,0.0001,1.5,  1.5,0.0001,3.0,  3.0,0.0001,1.5,  3.0,0.0001,3.0,
        //v9-v10-v14-v15 => 28, 29, 30, 31
        1.5,0.0001,4.5,  1.5,0.0001,6.0,  3.0,0.0001,4.5,  3.0,0.0001,6.0,
        //v11-v12-v16-v17 => 32, 33, 34, 35
        3.0,0.0001,0.0,  3.0,0.0001,1.5,  4.5,0.0001,0.0,  4.5,0.0001,1.5,
        //v13-v14-v18-v19 => 36, 37, 38, 39
        3.0,0.0001,3.0,  3.0,0.0001,4.5,  4.5,0.0001,3.0,  4.5,0.0001,4.5,
        //v17-v18-v22-v23 => 40, 41, 42, 43
        4.5,0.0001,1.5,  4.5,0.0001,3.0,  6.0,0.0001,1.5,  6.0,0.0001,3.0,
        //v19-v20-v24-v25 => 44, 45, 46, 47
        4.5,0.0001,4.5,  4.5,0.0001,6.0,  6.0,0.0001,4.5,  6.0,0.0001,6.0,
    ]);

    //create buffer for vertices
    //bind buffer operations to created one
    //pass vertices to webGL by filling buffer with the array
    const roomVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, roomVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, roomVertices, gl.STATIC_DRAW);

    //normals buffer
    const roomNormals = new Float32Array([
        //floor background
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,

        //left wall
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,

        //right wall
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,

        //ceiling
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
    ]);

    const roomNormalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, roomNormalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, roomNormals, gl.STATIC_DRAW);

    //create an array specifying the colour of each vertex
    const roomColours = new Float32Array([
        //floor background
        0.9, 0.9, 0.9, 1.0,
        0.9, 0.9, 0.9, 1.0,
        0.9, 0.9, 0.9, 1.0,
        0.9, 0.9, 0.9, 1.0,

        //left wall
        0.0, 1.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,

        //right wall
        0.0, 0.0, 1.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 0.0, 1.0, 1.0,

        //ceiling
        0.9, 0.9, 0.9, 1.0,
        0.9, 0.9, 0.9, 1.0,
        0.9, 0.9, 0.9, 1.0,
        0.9, 0.9, 0.9, 1.0,

        //floor squares
        0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,
        0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  
        0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  
        0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  
        0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  
        0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  
        0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  
        0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  
    ]);

    //pass this colour data into a colour buffer
    const roomColourBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, roomColourBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, roomColours, gl.STATIC_DRAW);

    //triangle vertex index buffer
    const roomIndices = new Uint16Array([
        //floor background
        0,1,2,  1,2,3,

        //left wall
        6,7,4,  7,4,5,
        
        //right wall
        8,9,10,  9,10,11,
        
        //ceiling
        12,13,14,  13,14,15,

        //floor squares
        16,17,18,  17,18,19,
        20,21,22,  21,22,23,
        24,25,26,  25,26,27,
        28,29,30,  29,30,31,
        32,33,34,  33,34,35,
        36,37,38,  37,38,39,
        40,41,42,  41,42,43,
        44,45,46,  45,46,47,
    ]);

    const roomIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, roomIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, roomIndices, gl.STATIC_DRAW);

    //return initialised buffer object
    return {
        roomPosition: roomVertexBuffer,
        roomColour: roomColourBuffer,
        roomNormals: roomNormalsBuffer,
        roomIndices: roomIndexBuffer,
        
    };
}



//rendering the scene
function draw(gl, canvas, programInfo, buffers, lookAtParams){
    //clear the canvas to opaque black
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //set perspective matrix
    const projMatrix = new Matrix4();
    projMatrix.setPerspective(45, canvas.width/canvas.height, 0.1, 100);

    //set the projection matrix
    const modelMatrix = new Matrix4();

    //set the view matrix
    const viewMatrix = new Matrix4();
    viewMatrix.setLookAt(
        lookAtParams.ex, lookAtParams.ey, lookAtParams.ez,  
        lookAtParams.lx, lookAtParams.ly, lookAtParams.lz,  
        0.0, 1.0, 0.0);

    //tell webGL how to extract vertex positions from buffer
    {
        //no. values per vertex
        const n = 3;
        //type of vertex data
        const type = gl.FLOAT;
        //don't normalise
        const normalise = false;
        //no. bytes to jump between values (0 = determine from n & type)
        const stride = 0;
        //no. bytes to start from start of buffer
        const offset = 0;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.roomPosition);
        gl.vertexAttribPointer(
            programInfo.attribLocations.u_Position,
            n,
            type,
            normalise,
            stride,
            offset
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.u_Position);
    }

    //tell webGL how to extract vertex colours from buffer in the same manner
    {
        const n = 4;
        const type = gl.FLOAT;
        const normalise = false;
        const stride = 0;
        const offset = 0;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.roomColour);
        gl.vertexAttribPointer(
            programInfo.attribLocations.u_Colour,
            n,
            type,
            normalise,
            stride,
            offset
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.u_Colour);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.roomIndices);

    //set shader uniforms
    gl.uniformMatrix4fv(programInfo.uniformLocations.projMatrix, false, projMatrix.elements);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelMatrix, false, modelMatrix.elements);
    gl.uniformMatrix4fv(programInfo.uniformLocations.viewMatrix, false, viewMatrix.elements);

    //draw arrays
    gl.drawElements(gl.TRIANGLES, 72, gl.UNSIGNED_SHORT, 0);
}