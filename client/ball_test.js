
    // Initialising data for sphere construction
    let sphere_div = 12;
    var i, ai, si, ci;
    var j, aj, sj, cj;
    var p1, p2;
    let sphereVerts = new Array();
    let sphereInds = new Array();
    let sphereTex = new Array();
    let sphereNorms = new Array();

    // Generating sphere vertices
    for (j = 40; j <= sphere_div+40; j++) {
        aj = j * Math.PI / sphere_div;
        sj = Math.sin(aj);
        cj = Math.cos(aj);
            for (i = 0; i <= sphere_div; i++) {
                ai = i * 2 * Math.PI / sphere_div;
                si = Math.sin(ai);
                ci = Math.cos(ai);

                sphereVerts.push(si * sj);  // X
                sphereVerts.push(cj);       // Y
                sphereVerts.push(ci * sj);  // Z
            }
    }
    
    // Generating sphere indices
    for (j = 0; j < sphere_div; j++) {
        for (i = 0; i < sphere_div; i++) {
          p1 = j * (sphere_div+1) + i;
          p2 = p1 + (sphere_div+1);

          sphereInds.push(p1);
          sphereInds.push(p2);
          sphereInds.push(p1 + 1);

          sphereInds.push(p1 + 1);
          sphereInds.push(p2);
          sphereInds.push(p2 + 1);
        }
    }
    for(let k = 0; k < sphereInds.length; k++){
        sphereInds[k] += 40;
    }

    // Generating sphere texture
    for (j = 0; j <= sphere_div; j++) {
        for (i = 0; i <= sphere_div; i++) {
          sphereTex.push(0.0);
          sphereTex.push(0.0);
        }
    }

    // Generating sphere normals
    for (j = 0; j <= sphere_div; j++) {
        for (i = 0; i <= sphere_div; i++) {
          sphereNorms.push(0.0);
          sphereNorms.push(1.0);
          sphereNorms.push(0.0);
        }
    }

    // Concatenate these sphere specific arrays into the main buffers
    roomVertices = new Float32Array(roomVertices.concat(sphereVerts));
    roomNormals = new Float32Array(roomNormals.concat(sphereNorms));
    texCoordinates = new Float32Array(texCoordinates.concat(sphereTex));
    roomIndices = new Uint16Array(roomIndices.concat(sphereInds));