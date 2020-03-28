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
            mvpMatrix: gl.getUniformLocation(shaderProgram, 'u_mvpMatrix'),
        },
    }

    gl.useProgram(programInfo.program);

    // Initialise camera position parameters
    let lookAtParams = {
        estep: 0.2,
        lstep: 2.0,
        ex: 0.0,
        ey: 0.0,
        ez: 0.0,
        lx: 0.0,
        ly: 0.0,
        lz: 0.0,    
    };

    // Initialise light parameters
    let lightParams = {
        ambient: new Vector3([0.2, 0.2, 0.2]),
        colour: new Vector3([1.0, 1.0, 1.0]),
        position: new Vector3([3.75, 3.25, 3.75]),
        partyOn: false,
        partyCols: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0], 
                    [1.0, 1.0, 0.0], [0.0, 1.0, 1.0], [1.0, 0.0, 1.0]],
    };

    let tvParams = {
        channel: 0,
        switch: [
            loadTexture(gl, programInfo, 'content/static.jpg'),
            loadTexture(gl, programInfo, 'content/gru.jpg'),
            loadTexture(gl, programInfo, 'content/simpsons.jpg'),
            loadTexture(gl, programInfo, 'content/yoda.jpg'),
        ],
    };

    //initialise vertex buffer
    const buffers = initBuffers(gl);

    // Load textures into texture array
    let textures = initTexArray(gl, programInfo);

    document.getElementById("coordinates").innerHTML = `Eye position: (${lookAtParams.ex.toFixed(1)}, ${lookAtParams.ey.toFixed(1)}, ${lookAtParams.ez.toFixed(1)})
                                                        Looking at: (${lookAtParams.lx.toFixed(1)}, ${lookAtParams.ly.toFixed(1)}, ${lookAtParams.lz.toFixed(1)})`; 

    // Initialise attribute arrays
    initAttribs(gl, programInfo, buffers);

    // function to render scene to canvas
    function render() {
        draw(gl, canvas, programInfo, lookAtParams, lightParams, tvParams, textures);
        requestAnimationFrame(render);
    }

    // moving camera on keypress
    document.onkeydown = function(ev){
        keypress(ev, lookAtParams, lightParams, tvParams);
    };

    // rendering initial scene
    requestAnimationFrame(render);
}

function initTexArray(gl, programInfo){
    let textures = new Array();

    const floorTex = loadTexture(gl, programInfo, 'content/floor.png');
    textures.push(["floor", floorTex]);

    const wall1Tex = loadTexture(gl, programInfo, 'content/wall1.png');
    textures.push(["wall1", wall1Tex]);

    const wall2Tex = loadTexture(gl, programInfo, 'content/wallpaper.jpg');
    textures.push(["wall2", wall2Tex]);

    const ceilingTex = loadTexture(gl, programInfo, 'content/ceiling.png');
    textures.push(["ceiling", ceilingTex]);

    const lightTex = loadTexture(gl, programInfo, 'content/lightshade.png');
    textures.push(["light", lightTex]);

    const sofaTex = loadTexture(gl, programInfo, 'content/sofa.jpg');
    textures.push(["sofa", sofaTex]);

    const woodTex = loadTexture(gl, programInfo, 'content/wood.jpeg');
    textures.push(["wood", woodTex]);

    const borderTex = loadTexture(gl, programInfo, 'content/border.jpg');
    textures.push(["border", borderTex]);

    const staticTex = loadTexture(gl, programInfo, 'content/static.jpg');
    textures.push(["channel", staticTex]);

    return textures;
}

//function to move camera when key pressed
function keypress(ev, lookAtParams, lightParams, tvParams){
    switch (ev.keyCode) {
        case 38: //up arrow
            lookAtParams.ly -= lookAtParams.lstep;
            break;
        case 40: //down arrow
            lookAtParams.ly += lookAtParams.lstep;
            break;
        case 39: //right arrow
            lookAtParams.lx += lookAtParams.lstep;
            break;
        case 37: //left arrow
            lookAtParams.lx -= lookAtParams.lstep;
            break;
        case 87: //w - increase up y axes
            lookAtParams.ey -= lookAtParams.estep;
            break;
        case 83: //s - decrease down y axes
            lookAtParams.ey += lookAtParams.estep;
            break;
        case 65: //a - decrease x axes
            lookAtParams.ex += lookAtParams.estep;
            break;
        case 68: //d - increase x axes
            lookAtParams.ex += lookAtParams.estep;
            break;
        case 88: //z - decrease z axes
            lookAtParams.ez += lookAtParams.estep;
            break;
        case 90: //x - increase z axes
            lookAtParams.ez -= lookAtParams.estep;
            break;
        case 80: //p - party mode
            lightParams.partyOn = !lightParams.partyOn;
            break;
        case 49: //1 - tv channel 1
            tvParams.channel = 0;
            break;
        case 50: //2 - tv channel 2
            tvParams.channel = 1;
            break;
        case 51: //3 - tv channel 3
            tvParams.channel = 2;
            break;
        case 52: //4 - tv channel 4
            tvParams.channel = 3;
            break;
        default:
            break;
    }

    document.getElementById("coordinates").innerHTML = `Eye position: (${lookAtParams.ex.toFixed(1)}, ${lookAtParams.ey.toFixed(1)}, ${lookAtParams.ez.toFixed(1)})
                                                        Looking at: (${lookAtParams.lx.toFixed(1)}, ${lookAtParams.ly.toFixed(1)}, ${lookAtParams.lz.toFixed(1)})`; 
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

// Vertex position buffer data
function initBuffers(gl){

    // Vertex position buffer data
    let roomVerts = [
        0.0,0.0,0.0,  7.5,0.0,0.0,  0.0,0.0,7.5,  7.5,0.0,7.5, // Floor (0-1-2-3)
        0.0,4.0,0.0,  0.0,4.0,7.5,  0.0,0.0,0.0,  0.0,0.0,7.5, // Left wall (4-5-6-7)
        0.0,0.0,0.0,  7.5,0.0,0.0,  0.0,4.0,0.0,  7.5,4.0,0.0, // Right wall (8-9-10-11)
        0.0,4.0,0.0,   7.5,4.0,0.0,   0.0,4.0,7.5,  7.5,4.0,7.5, // Ceiling (12-13-14-15)
    ];

    let lightCordVerts = [
        3.72,4.0,3.77,  3.77,4.0,3.77,  3.72,3.5,3.77,  3.77,3.5,3.77, // Side 1 (16-17-18-19)        
        3.77,4.0,3.77,  3.77,4.0,3.72,  3.77,3.5,3.77,  3.77,3.5,3.72, // Side 2 (20-21-22-23)      
        3.72,4.0,3.72,  3.77,4.0,3.72,  3.72,3.5,3.72,  3.77,3.5,3.72, // Side 3 (24-25-26-27)    
        3.72,4.0,3.77,  3.72,4.0,3.72,  3.72,3.5,3.77,  3.72,3.5,3.72, // Side 4 (28-29-30-31)
    ];

    let lightShadeVerts = [
        4.0,3.5,4.0,  3.5,3.5,4.0,  4.0,3.5,3.5,  3.5,3.5,3.5, // Top (32-33-34-35)
        4.0,3.5,4.0,  3.5,3.5,4.0,  4.0,3.0,4.0,  3.5,3.0,4.0, // Side 1 (36-37-38-39)
        4.0,3.5,4.0,  4.0,3.5,3.5,  4.0,3.0,4.0,  4.0,3.0,3.5, // Side 2 (40-41-42-43)
        3.5,3.5,4.0,  3.5,3.5,3.5,  3.5,3.0,4.0,  3.5,3.0,3.5, // Side 3 (44-45-46-47)
        4.0,3.5,3.5,  3.5,3.5,3.5,  4.0,3.0,3.5,  3.5,3.0,3.5, // Side 4 (48-49-50-51)
        4.0,3.0,4.0,  3.5,3.0,4.0,  4.0,3.0,3.5,  3.5,3.0,3.5, // Bottom (52-53-54-55)
    ];

    let sofaVerts = [
        // Back
        0.0,1.5,4.0,  0.3,1.5,4.0,  0.0,0.25,4.0,  0.3,0.25,4.0,  // Front set (56-57-58-59)
        0.0,1.5,1.0,  0.3,1.5,1.0,  0.0,0.25,1.0,  0.3,0.25,1.0,  // Back set (60-61-62-63)

        // Left arm
        0.3,1.1,4.0,  1.0,1.1,4.0,  0.3,0.25,4.0,  1.0,0.25,4.0, // Front set (64-65-66-67)
        0.3,1.1,3.7,  1.0,1.1,3.7,  0.3,0.25,3.7,  1.0,0.25,3.7, // Back set (68-69-70-71)

        // Right arm
        0.3,1.1,1.3,  1.0,1.1,1.3,  0.3,0.25,1.3,  1.0,0.25,1.3, // Front set (72-73-74-75)
        0.3,1.1,1.0,  1.0,1.1,1.0,  0.3,0.25,1.0,  1.0,0.25,1.0, // Back set (76-77-78-79)

        // Seat
        0.3,0.55,3.7,  1.0,0.55,3.7,  0.3,0.25,3.7,  1.0,0.25,3.7, // Front set (80-81-82-83)
        0.3,0.55,1.3,  1.0,0.55,1.3,  0.3,0.25,1.3,  1.0,0.25,1.3, // Back set (84-85-86-87)

        // Leg 1
        0.0,0.25,4.0,  0.2,0.25,4.0,  0.0,0.0,4.0,  0.2,0.0,4.0, // Front set (88-89-90-91)
        0.0,0.25,3.8,  0.2,0.25,3.8,  0.0,0.0,3.8,  0.2,0.0,3.8, // Back set (92-93-94-95)
   
        // Leg 2
        0.8,0.25,4.0,  1.0,0.25,4.0,  0.8,0.0,4.0,  1.0,0.0,4.0, // Front set (96-97-98-99)
        0.8,0.25,3.8,  1.0,0.25,3.8,  0.8,0.0,3.8,  1.0,0.0,3.8, // Back set (100-101-102-103)

        // Leg 3
        0.8,0.25,1.2,  1.0,0.25,1.2,  0.8,0.0,1.2,  1.0,0.0,1.2, // Front set (104-105-106-107)
        0.8,0.25,1.0,  1.0,0.25,1.0,  0.8,0.0,1.0,  1.0,0.0,1.0, // Back set (108-109-110-111)

        // Leg 4
        0.0,0.25,1.2,  0.2,0.25,1.2,  0.0,0.0,1.2,  0.2,0.0,1.2, // Front set (112-113-114-115)
        0.0,0.25,1.0,  0.2,0.25,1.0,  0.0,0.0,1.0,  0.2,0.0,1.0, // Back set (116-117-118-119)
    ];

    let tvVerts = [
        1.8,2.4,0.1,  3.5,2.4,0.1,  1.8,1.3,0.1,  3.5,1.3,0.1, // Front set (120-121-122-123)
        1.8,2.4,0.0,  3.5,2.4,0.0,  1.8,1.3,0.0,  3.5,1.3,0.0,  // Back set (124-125-126-127)
        1.9,2.3,0.1001,  3.4,2.3,0.1001,  1.9,1.4,0.1001,  3.4,1.4,0.1001, // Screen (128-129-130-131)
    ];

    let vertices = new Float32Array(roomVerts.concat(lightCordVerts, lightShadeVerts, sofaVerts, tvVerts));

    // Triangle vertex index buffer data
    let roomIndices = [
        0,1,2,  1,2,3, //floor
        6,7,4,  7,4,5, //left wall
        8,9,10,  9,10,11, //right wall
        12,13,14,  13,14,15, //ceiling
    ];

    let lightCordIndices = [
        16,17,18,  17,18,19, //side 1
        20,21,22,  21,22,23, //side 2
        24,25,26,  25,26,27, //side 3
        28,29,30,  29,30,31, //side 4
    ];

    let lightShadeIndices = [
        32,33,34,  33,34,35, //top
        36,37,38,  37,38,39, //side 1
        40,41,42,  41,42,43, //side 2
        44,45,46,  45,46,47, //side 3
        48,49,50,  49,50,51, //side 4
        52,53,54,  53,54,55, //bottom
    ];

    let sofaIndices = [
        // Back
        56,57,58,  57,58,59, // Front side
        57,63,59,  57,63,61, // Side 1
        56,61,57,  56,61,60, // Side 2
        56,58,60,  58,60,62, // Side 3
        58,59,62,  59,62,63, // Side 4
        60,61,62,  61,62,63, // Back side

        // Left arm
        64,65,66,  65,66,67, // Front side
        65,71,67,  65,71,69, // Side 1
        64,69,65,  64,69,68, // Side 2
        64,66,68,  66,68,70, // Side 3
        66,67,70,  67,70,71, // Side 4
        68,69,70,  69,70,71, // Back side

        // Right arm
        72,73,74,  73,74,75, // Front side
        73,79,75,  73,79,77, // Side 1
        72,77,73,  72,77,76, // Side 2
        72,74,76,  74,76,78, // Side 3
        74,75,78,  75,78,79, // Side 4
        76,77,78,  77,78,79, // Back side 
        
        // Seat
        80,81,82,  81,82,83, // Front side
        81,87,83,  81,87,85, // Side 1
        80,85,81,  80,85,84, // Side 2
        80,82,84,  82,84,86, // Side 3
        82,83,86,  83,86,87, // Side 4
        84,85,86,  85,86,87, // Back side 

        // Leg 1
        88,89,90,  89,90,91, // Front side
        89,95,91,  89,95,93, // Side 1
        88,93,89,  88,93,92, // Side 2
        88,90,92,  90,92,94, // Side 3
        90,91,94,  91,94,95, // Side 4
        92,93,94,  93,94,95, // Back side 

        // Leg 2
        96,97,98,  97,98,99, // Front side
        97,103,99,  97,103,101, // Side 1
        96,101,97,  96,101,100, // Side 2
        96,98,100,  98,100,102, // Side 3
        98,99,102,  99,102,103, // Side 4
        100,101,102,  101,102,103, // Back side 

        // Leg 3
        104,105,106,  105,106,107, // Front side
        105,111,107,  105,111,109, // Side 1
        104,109,105,  104,109,108, // Side 2
        104,106,108,  106,108,110, // Side 3
        106,107,110,  107,110,111, // Side 4
        108,109,110,  109,110,111, // Back side 

        // Leg 4
        112,113,114,  113,114,115, // Front side
        113,119,115,  113,119,117, // Side 1
        112,117,113,  112,117,116, // Side 2
        112,114,116,  114,116,118, // Side 3
        114,115,118,  115,118,119, // Side 4
        116,117,118,  117,118,119, // Back side 
    ];

    let tvIndices = [
        120,121,122,  121,122,123, // Front
        120,121,124,  121,124,125, // Top
        124,120,126,  120,126,122, // Left
        123,122,127,  122,127,126, // Bottom
        123,121,127,  121,127,125, // Right
        124,125,126,  125,126,127, // Back
        128,129,130,  129,130,131, // Screen
    ];

    let indices = new Uint16Array(roomIndices.concat(lightCordIndices, lightShadeIndices, sofaIndices, tvIndices));

    // Normals buffer data
    let roomNormals = [
        0.0,1.0,0.0,  0.0,1.0,0.0,  0.0,1.0,0.0,  0.0,1.0,0.0, // Floor
        1.0,0.0,0.0,  1.0,0.0,0.0,  1.0,0.0,0.0,  1.0,0.0,0.0, // Left wall
        -1.0,0.0,0.0,  -1.0,0.0,0.0,  -1.0,0.0,0.0,  -1.0,0.0,0.0, // Right wall
        0.0,-1.0,0.0,  0.0,-1.0,0.0,  0.0,-1.0,0.0,  0.0,-1.0,0.0, // Ceiling
    ];

    let lightCordNormals = [
        0.0,0.0,1.0,  0.0,0.0,1.0,  0.0,0.0,1.0,  0.0,0.0,1.0, //side 1
        1.0,0.0,0.0,  1.0,0.0,0.0,  1.0,0.0,0.0,  1.0,0.0,0.0, //side 2
        0.0,0.0,-1.0,  0.0,0.0,-1.0,  0.0,0.0,-1.0,  0.0,0.0,-1.0,  //side 3
        -1.0,0.0,0.0,  -1.0,0.0,0.0,  -1.0,0.0,0.0,  -1.0,0.0,0.0, //side 4
    ];

    let lightShadeNormals = [
        0.0,1.0,0.0,  0.0,1.0,0.0,  0.0,1.0,0.0,  0.0,1.0,0.0, //top
        0.0,0.0,1.0,  0.0,0.0,1.0,  0.0,0.0,1.0,  0.0,0.0,1.0, //side 1
        1.0,0.0,0.0,  1.0,0.0,0.0,  1.0,0.0,0.0,  1.0,0.0,0.0, //side 2
        0.0,0.0,-1.0,  0.0,0.0,-1.0,  0.0,0.0,-1.0,  0.0,0.0,-1.0,  //side 3
        -1.0,0.0,0.0,  -1.0,0.0,0.0,  -1.0,0.0,0.0,  -1.0,0.0,0.0, //side 4
        0.0,-1.0,0.0,  0.0,-1.0,0.0,  0.0,-1.0,0.0,  0.0,-1.0,0.0, //bottom
    ];

    let sofaNormals = [
        // Back
        0.0,1.0,1.0,  1.0,1.0,1.0,  0.0,-1.0,1.0,  1.0,-1.0,1.0,  // Front set
        0.0,1.0,-1.0,  1.0,1.0,-1.0,  0.0,-1.0,-1.0,  1.0,-1.0,-1.0,  //Back set

        // Left arm
        0.0,1.0,1.0,  1.0,1.0,1.0,  0.0,-1.0,1.0,  1.0,-1.0,1.0,  // Front set
        0.0,1.0,-1.0,  1.0,1.0,-1.0,  0.0,-1.0,-1.0,  1.0,-1.0,-1.0,  //Back set

        // Right arm
        0.0,1.0,1.0,  1.0,1.0,1.0,  0.0,-1.0,1.0,  1.0,-1.0,1.0,  // Front set
        0.0,1.0,-1.0,  1.0,1.0,-1.0,  0.0,-1.0,-1.0,  1.0,-1.0,-1.0,  //Back set

        // Seat
        1.0,1.0,-1.0,  0.0,1.0,-1.0,  0.0,1.0,-1.0,  1.0,-1.0,0.0,  // Front set
        1.0,1.0,1.0,  1.0,1.0,1.0,  0.0,-1.0,0.0,  1.0,-1.0,0.0,  // Back set

        // Leg 1
        -1.0,0.0,1.0,  1.0,0.0,1.0,  -1.0,0.0,1.0,  1.0,0.0,1.0,  // Front set
        -1.0,0.0,-1.0,  1.0,0.0,-1.0,  -1.0,0.0,-1.0,  1.0,0.0,-1.0,  // Back set

        // Leg 2
        -1.0,0.0,1.0,  1.0,0.0,1.0,  -1.0,0.0,1.0,  1.0,0.0,1.0,  // Front set
        -1.0,0.0,-1.0,  1.0,0.0,-1.0,  -1.0,0.0,-1.0,  1.0,0.0,-1.0,  // Back set

        // Leg 3
        -1.0,0.0,1.0,  1.0,0.0,1.0,  -1.0,0.0,1.0,  1.0,0.0,1.0,  // Front set
        -1.0,0.0,-1.0,  1.0,0.0,-1.0,  -1.0,0.0,-1.0,  1.0,0.0,-1.0,  // Back set

        // Leg 4
        -1.0,0.0,1.0,  1.0,0.0,1.0,  -1.0,0.0,1.0,  1.0,0.0,1.0,  // Front set
        -1.0,0.0,-1.0,  1.0,0.0,-1.0,  -1.0,0.0,-1.0,  1.0,0.0,-1.0,  // Back set
    ];

    let tvNormals = [
        -1.0,1.0,1.0,  1.0,1.0,1.0,  -1.0,-1.0,1.0,  1.0,-1.0,1.0, // Front set
        -1.0,1.0,0.0,  1.0,1.0,0.0,  -1.0,-1.0,0.0,  1.0,-1.0,0.0, // Back set
        0.0,0.0,1.0,  0.0,0.0,1.0,  0.0,0.0,1.0,  0.0,0.0,1.0, // Screen
    ];

    let normals = new Float32Array(roomNormals.concat(lightCordNormals, lightShadeNormals, sofaNormals, tvNormals));

    // Texture coordinates buffer data
    let roomTex = [
        0.0,0.0,  0.0,1.0,  1.0,0.0,  1.0,1.0, // Floor
        1.0,0.0,  0.0,0.0,  1.0,1.0,  0.0,1.0, // Left Wall
        1.0,1.0,  0.0,1.0,  1.0,0.0,  0.0,0.0, // Right Wall
        0.0,0.0,  1.0,0.0,  0.0,1.0,  1.0,1.0, // Ceiling
    ];

    let lightCordTex = [
        // Light cord
        0.0,0.0,  1.0,0.0,  0.0,0.1,  1.0,1.0,  //side 1
        0.0,0.0,  1.0,0.0,  0.0,0.1,  1.0,1.0,  //side 2
        0.0,0.0,  1.0,0.0,  0.0,0.1,  1.0,1.0,  //side 3
        0.0,0.0,  1.0,0.0,  0.0,0.1,  1.0,1.0,  //side 4
    ];

    let lightShadeTex = [
        // Light shade
        1.0,1.0,  0.0,1.0,  1.0,0.0, 0.0,0.0, //top
        1.0,1.0,  0.0,1.0,  1.0,0.0, 0.0,0.0, //side 1
        0.0,1.0,  1.0,1.0,  0.0,0.0,  1.0,0.0, //side 2
        1.0,1.0,  0.0,1.0,  1.0,0.0,  0.0,0.0, //side 3
        0.0,1.0,  1.0,1.0,  0.0,0.0,  1.0,0.0, //side 4
        1.0,1.0,  0.0,1.0,  1.0,0.0,  0.0,0.0, //bottom
    ];

    let sofaTex = [
        // Back
        0.0,1.0,  1.0,1.0,  0.0,0.0,  1.0,0.0, // Front set
        0.0,1.0,  1.0,1.0,  0.0,0.0,  1.0,0.0, // Back set

        // Left arm
        0.0,1.0,  1.0,1.0,  0.0,0.0,  1.0,0.0, // Front set
        0.0,1.0,  1.0,1.0,  0.0,0.0,  1.0,0.0, // Back set

        // Right arm
        0.0,1.0,  1.0,1.0,  0.0,0.0,  1.0,0.0, // Front set
        0.0,1.0,  1.0,1.0,  0.0,0.0,  1.0,0.0, // Back set

        // Seat
        0.0,1.0,  1.0,1.0,  0.0,0.0,  1.0,0.0, // Front set
        0.0,1.0,  1.0,1.0,  0.0,0.0,  1.0,0.0, // Back set

        // Leg 1
        0.0,1.0,  1.0,1.0,  0.0,0.0,  1.0,0.0, // Front set
        0.0,1.0,  1.0,1.0,  0.0,0.0,  1.0,0.0, // Back set

        // Leg 2
        0.0,1.0,  1.0,1.0,  0.0,0.0,  1.0,0.0, // Front set
        0.0,1.0,  1.0,1.0,  0.0,0.0,  1.0,0.0, // Back set

        // Leg 3
        0.0,1.0,  1.0,1.0,  0.0,0.0,  1.0,0.0, // Front set
        0.0,1.0,  1.0,1.0,  0.0,0.0,  1.0,0.0, // Back set

        // Leg 4
        0.0,1.0,  1.0,1.0,  0.0,0.0,  1.0,0.0, // Front set
        0.0,1.0,  1.0,1.0,  0.0,0.0,  1.0,0.0, // Back set
    ];

    let tvTex = [
        1.0,0.0,  0.0,0.0,  1.0,1.0,  0.0,1.0, // Front set
        1.0,0.0,  0.0,0.0,  1.0,1.0,  0.0,1.0, // Back set
        0.0,0.0,  1.0,0.0,  0.0,1.0,  1.0,1.0, // Screen
    ];

    let texCoordinates = new Float32Array(roomTex.concat(lightCordTex, lightShadeTex, sofaTex, tvTex));

    // Form buffer for vertices
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Form buffer for indices
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // Form buffer for normals
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

    // Form buffer for texture coordinates
    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoordinates, gl.STATIC_DRAW);

    // Return initialised buffers
    return {
        roomPosition: vertexBuffer,
        roomNormal: normalBuffer,
        indices: indexBuffer,
        texCoord: texCoordBuffer,
    };
}

function initAttribs(gl, programInfo, buffers){
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

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
};

// Initiating attribute array buffer & matrices
function draw(gl, canvas, programInfo, lookAtParams, lightParams, tvParams, textures){
    //clear the canvas to opaque black
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //set projection matrix
    let projMat = new Matrix4();
    projMat.setPerspective(55, canvas.width/canvas.height, 0.1, 100);

    //set the model matrix
    let modelMat = new Matrix4();

    //set the view matrix
    let viewMat = new Matrix4();
    viewMat.setLookAt(
        10.0, 2.0, 10.0,
        0.0, 2.0, 0.0,  
        0.0, 1.0, 0.0
    );

    //set the normal matrix
    let normalMat = new Matrix4();
    normalMat.setInverseOf(modelMat);
    normalMat.transpose();

    // Set lighting colours
    let lightCol = lightParams.colour;
    if(lightParams.partyOn){
        let index = Math.floor(Math.random() * (lightParams.partyCols.length));
        lightCol = new Vector3(lightParams.partyCols[index]);
    };

    // let lightPos = lightParams.position + 

    // Rotate to look left/right/up/down
    modelMat.setTranslate(-lookAtParams.ex, 0.0, -lookAtParams.ez);
    modelMat.rotate(lookAtParams.lx, 0.0, 1.0, 0.0);
    modelMat.rotate(lookAtParams.ly, 1.0, 0.0, 0.0);
    modelMat.translate(lookAtParams.ex, 0.0, lookAtParams.ez);

    // Translate to move in +/- x/y/z direction
    modelMat.translate(lookAtParams.ex,lookAtParams.ey,lookAtParams.ez);

    // Set shader uniforms
    gl.uniformMatrix4fv(programInfo.uniformLocations.projMatrix, false, projMat.elements);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelMatrix, false, modelMat.elements);
    gl.uniformMatrix4fv(programInfo.uniformLocations.viewMatrix, false, viewMat.elements);
    gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMat.elements);

    gl.uniform3fv(programInfo.uniformLocations.ambientLight, lightParams.ambient.elements);
    gl.uniform3fv(programInfo.uniformLocations.lightColour, lightCol.elements);
    gl.uniform3fv(programInfo.uniformLocations.lightPosition, lightParams.position.elements);

    let k = 0;

    // Floor
    k = drawElem(gl, textures, tvParams, 0, k);

    // Left wall
    k = drawElem(gl, textures, tvParams, 1, k);

    // Right wall
    k = drawElem(gl, textures, tvParams, 2, k);

    // Ceiling
    k = drawElem(gl, textures, tvParams, 3, k);

    // Light
    k = drawElem(gl, textures, tvParams, 4, k);

    
    // modelMat.translate(2.0,.0,2.0);

    // // Set shader uniforms
    // gl.uniformMatrix4fv(programInfo.uniformLocations.projMatrix, false, projMat.elements);
    // gl.uniformMatrix4fv(programInfo.uniformLocations.modelMatrix, false, modelMat.elements);
    // gl.uniformMatrix4fv(programInfo.uniformLocations.viewMatrix, false, viewMat.elements);
    // gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMat.elements);

    // gl.uniform3fv(programInfo.uniformLocations.ambientLight, lightParams.ambient.elements);
    // gl.uniform3fv(programInfo.uniformLocations.lightColour, lightCol.elements);
    // gl.uniform3fv(programInfo.uniformLocations.lightPosition, lightParams.position.elements);

    // Sofa body
    k = drawElem(gl, textures, tvParams, 5, k);

    // Sofa feet
    k = drawElem(gl, textures, tvParams, 6, k);

    // TV frame
    k = drawElem(gl, textures, tvParams, 7, k);

    // TV screen
    k = drawElem(gl, textures, tvParams, 8, k);
}

function drawElem(gl, textures, tvParams, i, k){
    let index = 1;
    switch (textures[i][0]) {
        case 'floor': 
            index = 1;
            break;
        case 'wall1': 
            index = 1;
            break;
        case 'wall2': 
            index = 1;
            break;
        case 'ceiling': 
            index = 1;
            break;
        case 'light': 
            index = 10;
            break;
        case 'sofa': 
            index = 24;
            break;
        case 'wood': 
            index = 24;
            break;
        case 'border': 
            index = 6;
            break;
        case 'channel': 
            index = 1;
            textures[i][1] = tvParams.switch[[tvParams.channel]];
            break;
        default:
            break;
    };

    for(let j=0; j<index; j++){
        gl.bindTexture(gl.TEXTURE_2D, textures[i][1]);
        {
            const v = 6;
            const type = gl.UNSIGNED_SHORT;
            const offset = 2*k*6;
            gl.drawElements(
                gl.TRIANGLES, 
                v, 
                type, 
                offset
            );
        }
        k++;
    };

    return k;
};
