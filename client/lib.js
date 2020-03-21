//initialising shader program - next need to pass through to webGL, complie and link togeter shaders
function initShaderProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE){
    //loadShader(gl, shader type, shader source) creates the two shaders from their sources
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, VSHADER_SOURCE);
    const fragShader = loadShader(gl, gl.FRAGMENT_SHADER, FSHADER_SOURCE);

    //creates program shaderProgram, and attaches shaders to it, linking them together
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);

    //sounds alert if compiling/linking fails
    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
        alert("Error: unable to initialise shader program " + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

//function which takes input of webGL context, shader type and source code, and creates + complies the shader (as used above)
function loadShader(gl, type, source){
    //create a new shader
    const shader = gl.createShader(type);

    //input shader's source code
    gl.shaderSource(shader, source);

    //compile shader
    gl.compileShader(shader);

    //check if compilation is successful
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        alert("Error: compilation failure " + gl.getShaderInfoLog);
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}