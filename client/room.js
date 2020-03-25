// Key:
// u_Example = uniform variable (in shader)
// a_Example = attribute (in shader)
// exampleVariable = pointers to shader variables/attributes
// exVar = local variable used to give values

const VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Normal;\n' +
  'attribute vec2 a_TexCoord;\n' +

  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  
  'varying highp vec3 v_Normal;\n' +
  'varying highp vec2 v_TexCoord;\n' +
  'varying highp vec3 v_Position;\n' +
  
  'void main() {\n' +
  '   gl_Position = u_ProjMatrix * u_ModelMatrix * u_ViewMatrix * a_Position;\n' +
  '   v_Position = vec3(u_ModelMatrix * a_Position);\n' +
  '   v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '   v_TexCoord = a_TexCoord;\n' +
  '}\n';

const FSHADER_SOURCE =
  'uniform highp vec3 u_LightColour;\n' +     
  'uniform highp vec3 u_LightPosition;\n' +  
  'uniform highp vec3 u_AmbientLight;\n' +  
  'uniform sampler2D u_Sampler;\n' +

  'varying highp vec3 v_Normal;\n' +
  'varying highp vec3 v_Position;\n' +
  'varying highp vec2 v_TexCoord;\n' +

  'void main() {\n' +
  '   highp vec3 normal = normalize(v_Normal);\n' +
  '   highp vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
  '   highp float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
  '   highp vec4 TexColour = texture2D(u_Sampler, v_TexCoord);\n' +
  '   highp vec3 diffuse = u_LightColour * TexColour.rgb * nDotL * 1.2;\n' +
  '   highp vec3 ambient = u_AmbientLight * TexColour.rgb;\n' +
  '   gl_FragColor = vec4(diffuse + ambient, TexColour.a);\n' +
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
            texCoord: gl.getAttribLocation(shaderProgram, 'a_TexCoord'),
            normal: gl.getAttribLocation(shaderProgram, 'a_Normal'),
        },
        uniformLocations: {
            modelMatrix: gl.getUniformLocation(shaderProgram, 'u_ModelMatrix'),
            projMatrix: gl.getUniformLocation(shaderProgram, 'u_ProjMatrix'),
            viewMatrix: gl.getUniformLocation(shaderProgram, 'u_ViewMatrix'),
            normalMatrix: gl.getUniformLocation(shaderProgram, 'u_NormalMatrix'),
            sampler: gl.getUniformLocation(shaderProgram, 'u_Sampler'),
            lightPosition: gl.getUniformLocation(shaderProgram, 'u_LightPosition'),
            ambientLight: gl.getUniformLocation(shaderProgram, 'u_AmbientLight'),
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

    //load textures into texture array
    let textures = new Array();

    const floorTex = loadTexture(gl, programInfo, 'floor.png');
    textures.push(floorTex);

    const wallTex = loadTexture(gl, programInfo, 'wall1.png');
    textures.push(wallTex);
    textures.push(wallTex);

    const ceilingTex = loadTexture(gl, programInfo, 'ceiling.png');
    textures.push(ceilingTex);

    const cordTex = loadTexture(gl, programInfo, 'lightshade.png');
    for(let ct=0; ct<10; ct++){
        textures.push(cordTex);
    }

    document.getElementById("coordinates").innerHTML = `Eye position: (${lookAtParams.ex.toFixed(1)}, ${lookAtParams.ey.toFixed(1)}, ${lookAtParams.ez.toFixed(1)})
                                                        Looking at: (${lookAtParams.lx.toFixed(1)}, ${lookAtParams.ly.toFixed(1)}, ${lookAtParams.lz.toFixed(1)})`; 

    // function to render scene to canvas
    function render() {
        draw(gl, canvas, programInfo, buffers, lookAtParams, textures);
        requestAnimationFrame(render);
    }

    // moving camera on keypress
    document.onkeydown = function(ev){
        keypress(ev, lookAtParams, gl, canvas, programInfo, buffers, lookAtParams, textures);
    };

    // rendering initial scene
    requestAnimationFrame(render);
}

//function to move camera when key pressed
function keypress(ev, lookAtParams, gl, canvas, programInfo, buffers, lookAtParams, textures){
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
    draw(gl, canvas, programInfo, buffers, lookAtParams, textures);
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
    let roomVertices = new Float32Array([
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

        // light cord side 1 (16-17-18-19)
        3.72, 4.0, 3.77,    3.77, 4.0, 3.77,    3.72, 3.5, 3.77,    3.77, 3.5, 3.77,  
        // cord side 2 (20-21-22-23)
        3.77, 4.0, 3.77,    3.77, 4.0, 3.72,    3.77, 3.5, 3.77,    3.77, 3.5, 3.72,
        // cord side 3 (24-25-26-27)
        3.72, 4.0, 3.72,    3.77, 4.0, 3.72,    3.72, 3.5, 3.72,    3.77, 3.5, 3.72,    
        // cord side 4 (28-29-30-31)
        3.72, 4.0, 3.77,    3.72, 4.0, 3.72,    3.72, 3.5, 3.77,    3.72, 3.5, 3.72,  

        // light shade top (32-33-34-35)
        4.0,3.5,4.0,  3.5,3.5,4.0,  4.0,3.5,3.5,  3.5,3.5,3.5,
        // shade side 1 (36-37-38-39)
        4.0,3.5,4.0,  3.5,3.5,4.0,  4.0,3.0,4.0,  3.5,3.0,4.0,  
        // shade side 2 (40-41-42-43)
        4.0,3.5,4.0,  4.0,3.5,3.5,  4.0,3.0,4.0,  4.0,3.0,3.5,  
        // shade side 3 (44-45-46-47)
        3.5,3.5,4.0,  3.5,3.5,3.5,  3.5,3.0,4.0,  3.5,3.0,3.5,
        // shade side 4 (48-49-50-51)
        4.0,3.5,3.5,  3.5,3.5,3.5,  4.0,3.0,3.5,  3.5,3.0,3.5,  
        // light shade bottom (52-53-54-55)
        4.0,3.0,4.0,  3.5,3.0,4.0,  4.0,3.0,3.5,  3.5,3.0,3.5,
    ]);

    //triangle vertex index buffer
    let roomIndices = new Uint16Array([
        //floor background
        0,1,2,  1,2,3,

        //left wall
        6,7,4,  7,4,5,
        
        //right wall
        8,9,10,  9,10,11,
        
        //ceiling
        12,13,14,  13,14,15,

        //light cord
        16,17,18,  17,18,19, //side 1
        20,21,22,  21,22,23, //side 2
        24,25,26,  25,26,27, //side 3
        28,29,30,  29,30,31, //side 4

        //light shade
        32,33,34,  33,34,35, //top
        36,37,38,  37,38,39, //side 1
        40,41,42,  41,42,43, //side 2
        44,45,46,  45,46,47, //side 3
        48,49,50,  49,50,51, //side 4
        52,53,54,  53,54,55, //bottom
    ]);

    //normals buffer
    let roomNormals = new Float32Array([
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

        //light cord
        0.0,0.0,1.0,  0.0,0.0,1.0,  0.0,0.0,1.0,  0.0,0.0,1.0, //side 1
        1.0,0.0,0.0,  1.0,0.0,0.0,  1.0,0.0,0.0,  1.0,0.0,0.0, //side 2
        0.0,0.0,-1.0,  0.0,0.0,-1.0,  0.0,0.0,-1.0,  0.0,0.0,-1.0,  //side 3
        -1.0,0.0,0.0,  -1.0,0.0,0.0,  -1.0,0.0,0.0,  -1.0,0.0,0.0, //side 4

        //light shade
        0.0,1.0,0.0,  0.0,1.0,0.0,  0.0,1.0,0.0,  0.0,1.0,0.0, //top
        0.0,0.0,1.0,  0.0,0.0,1.0,  0.0,0.0,1.0,  0.0,0.0,1.0, //side 1
        1.0,0.0,0.0,  1.0,0.0,0.0,  1.0,0.0,0.0,  1.0,0.0,0.0, //side 2
        0.0,0.0,-1.0,  0.0,0.0,-1.0,  0.0,0.0,-1.0,  0.0,0.0,-1.0,  //side 3
        -1.0,0.0,0.0,  -1.0,0.0,0.0,  -1.0,0.0,0.0,  -1.0,0.0,0.0, //side 4
        0.0,-1.0,0.0,  0.0,-1.0,0.0,  0.0,-1.0,0.0,  0.0,-1.0,0.0, //bottom
    ]);

    //texture buffer
    let texCoordinates = new Float32Array([
        // Floor
        0.0,  0.0,
        0.0,  1.0,
        1.0,  0.0,
        1.0,  1.0,

        // Left Wall
        1.0,  0.0,
        0.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,

        // Right Wall
        0.5,  1.0,
        1.0,  1.0,
        0.5,  0.5,
        1.0,  0.5,

        // Ceiling
        0.0,  0.0,
        1.0,  0.0,
        0.0,  1.0,
        1.0,  1.0,

        // Light cord
        0.0,0.0,  1.0,0.0,  0.0,0.1,  1.0,1.0,  //side 1
        0.0,0.0,  1.0,0.0,  0.0,0.1,  1.0,1.0,  //side 2
        0.0,0.0,  1.0,0.0,  0.0,0.1,  1.0,1.0,  //side 3
        0.0,0.0,  1.0,0.0,  0.0,0.1,  1.0,1.0,  //side 4

        // Light shade
        1.0,1.0,  0.0,1.0,  1.0,0.0, 0.0,0.0, //top
        1.0,1.0,  0.0,1.0,  1.0,0.0, 0.0,0.0, //side 1
        0.0,1.0,  1.0,1.0,  0.0,0.0,  1.0,0.0, //side 2
        1.0,1.0,  0.0,1.0,  1.0,0.0,  0.0,0.0, //side 3
        0.0,1.0,  1.0,1.0,  0.0,0.0,  1.0,0.0, //side 4
        1.0,1.0,  0.0,1.0,  1.0,0.0,  0.0,0.0, //bottom
    ]);

    // Create buffer for vertices
    const roomVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, roomVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, roomVertices, gl.STATIC_DRAW);

    // Create buffer for indices
    const roomIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, roomIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, roomIndices, gl.STATIC_DRAW);

    // Create buffer for normals
    const roomNormalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, roomNormalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, roomNormals, gl.STATIC_DRAW);

    // Create buffer for texture coordinates
    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoordinates, gl.STATIC_DRAW);

    //return initialised buffer object
    return {
        roomPosition: roomVertexBuffer,
        roomNormal: roomNormalsBuffer,
        roomIndices: roomIndexBuffer,
        texCoord: texCoordBuffer,
    };
}

//rendering the scene
function draw(gl, canvas, programInfo, buffers, lookAtParams, textures){
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

    // tell webgl how to pull out the texture coordinates from buffer
    {
        const n = 2;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texCoord);
        gl.vertexAttribPointer(
            programInfo.attribLocations.texCoord, 
            n, 
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

    //set light parameters
    const ambLight = new Vector3([0.2, 0.2, 0.2]);
    const lightCol = new Vector3([1.0, 1.0, 1.0]);
    const lightPos = new Vector3([3.75, 3.25, 3.75]);

    //set shader uniforms
    gl.uniformMatrix4fv(programInfo.uniformLocations.projMatrix, false, projMat.elements);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelMatrix, false, modelMat.elements);
    gl.uniformMatrix4fv(programInfo.uniformLocations.viewMatrix, false, viewMat.elements);
    gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMat.elements);

    gl.uniform3fv(programInfo.uniformLocations.ambientLight, ambLight.elements);
    gl.uniform3fv(programInfo.uniformLocations.lightColour, lightCol.elements);
    gl.uniform3fv(programInfo.uniformLocations.lightPosition, lightPos.elements);

    // ntex = number of textures = one for each room side (4) + one for each light cord side (4) + one for each side of the light shade (6)
    const ntex = 4+4+5;
    for(let i=0; i<ntex; i++){

        gl.bindTexture(gl.TEXTURE_2D, textures[i]);
        {
            const v = 6;
            const type = gl.UNSIGNED_SHORT;
            const offset = 2*i*6;
            gl.drawElements(
                gl.TRIANGLES, 
                v, 
                type, 
                offset
            );
        }
    }
}
