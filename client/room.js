//Current scene:
//  rainbow 5x5 floor made from one square plane through y=0
//  perspective looking at origin 


const VSHADER_SOURCE = 
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Colour;\n' +
    'attribute vec2 a_TexCoord;\n' +
    'attribute vec3 a_Normal;\n' +

    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_ProjMatrix;\n' +
    'uniform mat4 u_ViewMatrix;\n' +
    'uniform mat4 u_NormalMatrix;\n' +
    'uniform highp vec3 u_LightDirection;\n' +
    'uniform highp vec3 u_LightColour;\n' +
    
    'varying lowp vec4 u_Colour;\n' +
    'varying highp vec2 u_TexCoord;\n' +
    'varying highp vec3 u_Lighting;\n' +

    'void main(){\n' +
    '   gl_Position = u_ProjMatrix * u_ModelMatrix * u_ViewMatrix * a_Position;\n' +
    '   u_Colour = a_Colour;\n' +
    '   u_TexCoord = a_TexCoord;\n' +

    '   highp vec3 ambientLight = vec3(0.4, 0.4, 0.4);\n' +
    '   highp vec4 normal = u_NormalMatrix * vec4(a_Normal, 1.0);\n' +
    '   highp float nDotL = max(dot(normal.xyz, u_LightDirection), 0.0);\n' +
    '   u_Lighting = ambientLight + (u_LightColour * nDotL);\n' +
    '}\n';

const FSHADER_SOURCE = 
    'uniform sampler2D u_Sampler;\n' +

    'varying lowp vec4 u_Colour;\n' +
    'varying highp vec2 u_TexCoord;\n' +
    'varying highp vec3 u_Lighting;\n' +

    'void main(){\n' +
    // '   gl_FragColor = u_Colour;\n' + // for colour surfaces
    // '   gl_FragColor = texture2D(u_Sampler, u_TexCoord);\n' + // for texture surfaces
    '   highp vec4 texColour = texture2D(u_Sampler, u_TexCoord);\n' +
    '   gl_FragColor = vec4(u_Lighting*texColour.rgb, texColour.a);\n' +
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
            position: gl.getAttribLocation(shaderProgram, 'a_Position'),
            colour: gl.getAttribLocation(shaderProgram, 'a_Colour'),
            texCoord: gl.getAttribLocation(shaderProgram, 'a_TexCoord'),
            normal: gl.getAttribLocation(shaderProgram, 'a_Normal'),
        },
        uniformLocations: {
            projMatrix: gl.getUniformLocation(shaderProgram, 'u_ProjMatrix'),
            modelMatrix: gl.getUniformLocation(shaderProgram, 'u_ModelMatrix'),
            viewMatrix: gl.getUniformLocation(shaderProgram, 'u_ViewMatrix'),
            sampler: gl.getUniformLocation(shaderProgram, 'u_Sampler'),
            normalMatrix: gl.getUniformLocation(shaderProgram, 'u_NormalMatrix'),
            lightDirection: gl.getUniformLocation(shaderProgram, 'u_LightDirection'),
            lightColour: gl.getUniformLocation(shaderProgram, 'u_LightColour'),
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

    //load texture
    const roomTex = loadTexture(gl, programInfo, 'floor.png');

    document.getElementById("coordinates").innerHTML = `Eye position: (${lookAtParams.ex.toFixed(1)}, ${lookAtParams.ey.toFixed(1)}, ${lookAtParams.ez.toFixed(1)})
                                                        Looking at: (${lookAtParams.lx.toFixed(1)}, ${lookAtParams.ly.toFixed(1)}, ${lookAtParams.lz.toFixed(1)})`; 

    // function to render scene to canvas
    function render() {
        draw(gl, canvas, programInfo, buffers, lookAtParams, roomTex);
        requestAnimationFrame(render);
    }

    // moving camera on keypress
    document.onkeydown = function(ev){
        keypress(ev, lookAtParams, gl, canvas, programInfo, buffers, lookAtParams, roomTex);
    };

    // rendering initial scene
    requestAnimationFrame(render);
}

//function to move camera when key pressed
function keypress(ev, lookAtParams, gl, canvas, programInfo, buffers, lookAtParams, roomTex){
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
    draw(gl, canvas, programInfo, buffers, lookAtParams, roomTex);
}

//function to determine if dimentions of texture are of power 2
function isPowerOf2(val){
    return (val & (val-1)) == 0;
}

//loading texture objects
function loadTexture(gl, programInfo, url){
    // initialise a webGL texture object
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // create a single blue pixel as a placeholder texture to upload whilst image loads
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);
    
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel)

    // create image object and link src to the image file
    const image = new Image();
    image.onload = function(){
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,srcFormat, srcType, image);

        // set up image / wrapping based on whether image dimentions are a power of 2
        if(isPowerOf2(image.width) && isPowerOf2(image.height)){
            // enable higher quality mipmap filtering
            gl.generateMipmap(gl.TEXTURE_2D);

        } else {
            // disable mipmapping/uv repeating & set wrapping to clamp to edge
            // diable s-coordinate wrapping/repeating
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            // diable t-coordinate wrapping/repeating
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            // can use gl.LINEAR or gl.NEAREST filtering as neither are mipmaps
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };

    image.src = url;

    // Tell WebGL we want to affect texture unit 0
    gl.activeTexture(gl.TEXTURE0);

    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(programInfo.uniformLocations.sampler, 0);

    return texture;
}

//initiate a buffer to hold vertex positions
function initBuffers(gl){

    //create an array of vertex positions (e.g. for a square)
    const roomVertices = new Float32Array([
        // floor
        0.0, 0.0, 0.0, //0
        7.5, 0.0, 0.0, //1
        0.0, 0.0, 7.5, //2
        7.5, 0.0, 7.5, //3

        // left wall
        0.0, 4.0, 0.0, //4
        0.0, 4.0, 7.5, //5
        0.0, 0.0, 0.0, //6
        0.0, 0.0, 7.5, //7

        // right wall
        0.0, 0.0, 0.0, //8
        7.5, 0.0, 0.0, //9
        0.0, 4.0, 0.0, //10
        7.5, 4.0, 0.0, //11

        // ceiling
        0.0, 4.0, 0.0, //12
        7.5, 4.0, 0.0, //13
        0.0, 4.0, 7.5, //14
        7.5, 4.0, 7.5, //15

        // //v1-v2-v6-v7 => 16, 17, 18, 19
        // 0.0,0.0001,0.0,  0.0,0.0001,1.5,  1.5,0.0001,0.0,  1.5,0.0001,1.5,
        // //v3-v4-v8-v9 => 20, 21, 22, 23
        // 0.0,0.0001,3.0,  0.0,0.0001,4.5,  1.5,0.0001,3.0,  1.5,0.0001,4.5,
        // //v7-v8-v12-v13 => 24, 25, 26, 27
        // 1.5,0.0001,1.5,  1.5,0.0001,3.0,  3.0,0.0001,1.5,  3.0,0.0001,3.0,
        // //v9-v10-v14-v15 => 28, 29, 30, 31
        // 1.5,0.0001,4.5,  1.5,0.0001,6.0,  3.0,0.0001,4.5,  3.0,0.0001,6.0,
        // //v11-v12-v16-v17 => 32, 33, 34, 35
        // 3.0,0.0001,0.0,  3.0,0.0001,1.5,  4.5,0.0001,0.0,  4.5,0.0001,1.5,
        // //v13-v14-v18-v19 => 36, 37, 38, 39
        // 3.0,0.0001,3.0,  3.0,0.0001,4.5,  4.5,0.0001,3.0,  4.5,0.0001,4.5,
        // //v17-v18-v22-v23 => 40, 41, 42, 43
        // 4.5,0.0001,1.5,  4.5,0.0001,3.0,  6.0,0.0001,1.5,  6.0,0.0001,3.0,
        // //v19-v20-v24-v25 => 44, 45, 46, 47
        // 4.5,0.0001,4.5,  4.5,0.0001,6.0,  6.0,0.0001,4.5,  6.0,0.0001,6.0,
        // //v21-v26-v22-v27 => 48, 49, 50, 51
        // 6.0,0.0001,0.0,  7.5,0.0001,0.0,  6.0,0.0001,1.5,  7.5,0.0001,1.5,
        // //v23-v28-v24-v29 => 52, 53, 54, 55
        // 6.0,0.0001,3.0,  7.5,0.0001,3.0,  6.0,0.0001,4.5,  7.5,0.0001,4.5,
        // //v25-v30-v32-v31 => 56, 57, 58, 59
        // 6.0,0.0001,6.0,  7.5,0.0001,6.0,  6.0,0.0001,7.5,  7.5,0.0001,7.5,
        // //v15-v20-v34-v33 => 60, 61, 62, 63
        // 3.0,0.0001,6.0,  4.5,0.0001,6.0,  3.0,0.0001,7.5,  4.5,0.0001,7.5,
        // //v5-v10-v36-v35 => 64, 65, 66, 67
        // 0.0,0.0001,6.0,  1.5,0.0001,6.0,  0.0,0.0001,7.5,  1.5,0.0001,7.5,
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

        // //floor squares
        // 0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,
        // 0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  
        // 0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  
        // 0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  
        // 0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  
        // 0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  
        // 0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  
        // 0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0, 
        // 0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0, 
        // 0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0, 
        // 0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  
        // 0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0, 
        // 0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0,  0.0,0.0,0.0,1.0, 
    ]);

    //pass this colour data into a colour buffer
    const roomColourBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, roomColourBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, roomColours, gl.STATIC_DRAW);

    //texture buffer
    const texCoordinates = new Float32Array([
        // Floor
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,

        // Left Wall
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,

        // Right Wall
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,

        // Ceiling
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
    ]);
    
    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoordinates, gl.STATIC_DRAW);

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

        // //floor squares
        // 16,17,18,  17,18,19,
        // 20,21,22,  21,22,23,
        // 24,25,26,  25,26,27,
        // 28,29,30,  29,30,31,
        // 32,33,34,  33,34,35,
        // 36,37,38,  37,38,39,
        // 40,41,42,  41,42,43,
        // 44,45,46,  45,46,47,
        // 48,49,50,  49,50,51,
        // 52,53,54,  53,54,55,
        // 56,57,58,  57,58,59,
        // 60,61,62,  61,62,63,
        // 64,65,66,  65,66,67,
    ]);

    const roomIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, roomIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, roomIndices, gl.STATIC_DRAW);

    //return initialised buffer object
    return {
        roomPosition: roomVertexBuffer,
        roomColour: roomColourBuffer,
        roomNormal: roomNormalsBuffer,
        roomIndices: roomIndexBuffer,
        texCoord: texCoordBuffer,
    };
}

//rendering the scene
function draw(gl, canvas, programInfo, buffers, lookAtParams, texture){
    //clear the canvas to opaque black
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //set projection matrix
    const projMat = new Matrix4();
    projMat.setPerspective(55, canvas.width/canvas.height, 0.1, 100);

    //set the model matrix
    const modelMat = new Matrix4();

    //set the view matrix
    const viewMat = new Matrix4();
    viewMat.setLookAt(
        lookAtParams.ex, lookAtParams.ey, lookAtParams.ez,  
        lookAtParams.lx, lookAtParams.ly, lookAtParams.lz,  
        0.0, 1.0, 0.0);

    //set the normal matrix
    const normalMat = new Matrix4();
    normalMat.setInverseOf(modelMat);
    normalMat.transpose();

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
            programInfo.attribLocations.position,
            n,
            type,
            normalise,
            stride,
            offset
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.position);
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
            programInfo.attribLocations.colour,
            n,
            type,
            normalise,
            stride,
            offset
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.colour);
    }

    // tell webgl how to pull out the texture coordinates from buffer
    {
        const num = 2; // every coordinate composed of 2 values
        const type = gl.FLOAT; // the data in the buffer is 32 bit float
        const normalize = false; // don't normalize
        const stride = 0; // how many bytes to get from one set to the next
        const offset = 0; // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texCoord);
        gl.vertexAttribPointer(
            programInfo.attribLocations.texCoord, 
            num, 
            type, 
            normalize, 
            stride, 
            offset
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.texCoord);
    }

    // specify the normal information
    {
        const n = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.roomNormal);
        gl.vertexAttribPointer(
            programInfo.attribLocations.normal,
            n,
            type,
            normalize,
            stride,
            offset
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.normal);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.roomIndices);

    //set light colour and direction
    const lightCol = new Vector3([1.0, 1.0, 1.0]);
    const lightDir = new Vector3([0.85, 0.8, 0.75]);
    lightDir.normalize();

    //set shader uniforms
    gl.uniformMatrix4fv(programInfo.uniformLocations.projMatrix, false, projMat.elements);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelMatrix, false, modelMat.elements);
    gl.uniformMatrix4fv(programInfo.uniformLocations.viewMatrix, false, viewMat.elements);
    gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMat.elements);
    gl.uniform3fv(programInfo.uniformLocations.lightColour, lightCol.elements);
    gl.uniform3fv(programInfo.uniformLocations.lightDirection, lightDir.elements);

    //draw arrays
    {
        const v = 24;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(
            gl.TRIANGLES, 
            v, 
            type, 
            offset
        );
    }
}