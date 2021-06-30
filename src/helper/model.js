function getTimeFraction(times, dt) {
    var segment = 0;
    while (dt > times[segment]) {
        segment++;

        // if the animation is longer than last keyframe just render the last 
        // keyframe for rest of the animation time
        if (segment == times.length) {
            segment--;
            // frac is hardcoded to 1.0 as we have already passed the last
            // timestamp of last keyframe, so clamping to 1.0 will avoid
            // unnecessary extrapolation
            return [segment, 1.0];
        }
    }

    segment = segment > 0 ? segment : 1;

    var start = times[segment - 1];
    var end = times[segment];
    var frac = (dt - start) / (end - start);
    return [segment, frac];
}

// resolve position for model at given time
// returns pose matrix array
function getPose(animData, skeleton, time, parentTransform, globalInverseTransform, output) {

    var btt = animData[skeleton.name];
    var dt = time % animData.duration;

    var globalTransform = parentTransform;

    if (btt.positions.length != 0) {
        // calculate interpolated position
        var fp = getTimeFraction(btt.positionsTime, dt);
        var position1 = btt.positions[fp[0] - 1];
        var position2 = btt.positions[fp[0]];
        var position = vec3.create();
        vec3.lerp(position, position1, position2, fp[1]);

        // calculate interpolated rotation
        fp = getTimeFraction(btt.rotationsTime, dt);
        var rotation1 = btt.rotations[fp[0] - 1];
        var rotation2 = btt.rotations[fp[0]];
        var rotation = quat.create();
        quat.slerp(rotation, rotation1, rotation2, fp[1]);

        // calculate interpolated scale
        fp = getTimeFraction(btt.scalesTime, dt);
        var scale1 = btt.scales[fp[0] - 1];
        var scale2 = btt.scales[fp[0]];
        var scale = vec3.create();
        vec3.lerp(scale, scale1, scale2, fp[1]);

        var localTransform = mat4.create();
        mat4.fromRotationTranslationScale(localTransform, rotation, position, scale);

        mat4.multiply(globalTransform, parentTransform, localTransform);
    }

    var m = mat4.create();
    mat4.multiply(m, globalInverseTransform, globalTransform);
    mat4.multiply(m, m, skeleton.offset);

    output[skeleton.id] = m;

    // update value for child bones
    for (var i = 0; i < skeleton.childs.length; i++) {
        getPose(animData, skeleton.childs[i], dt, globalTransform, globalInverseTransform, output);
    }
}

function loadModel(mdl, path) {
    var model = {};

    // pyramid Position
    var vertices = new Float32Array(mdl.vertex);
    var indices = new Uint32Array(mdl.index);
    model.numElements = mdl.index.length;

    model.vao = gl.createVertexArray();
    gl.bindVertexArray(model.vao);

    model.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_VERTEX,
        3, // 3 for x,y,z axes in vertex array
        gl.FLOAT,
        false, // is normalized?
        16 * 4, 0 * 4); // stride and offset
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_VERTEX);

    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_NORMAL,
        3, // 3 for x,y,z axes in vertex array
        gl.FLOAT,
        false, // is normalized?
        16 * 4, 3 * 4); // stride and offset
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_NORMAL);

    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_TEXCOORD0,
        2, // 2 for s,t axes in vertex array
        gl.FLOAT,
        false, // is normalized?
        16 * 4, 6 * 4); // stride and offset
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_TEXCOORD0);

    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_BONEIDS,
        4, //
        gl.FLOAT,
        false,
        16 * 4, 8 * 4); // stride and offset
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_BONEIDS);

    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_BONEWEIGHTS,
        4, // 
        gl.FLOAT,
        false, // is normalized?
        16 * 4, 12 * 4); // stride and offset
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_BONEWEIGHTS);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    model.vboElement = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.vboElement);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);

    vertices.length = [];
    indices.length = [];
    mdl.vertex.length = [];
    mdl.index.length = [];

    model.albedoMap = loadTexture(path + "/albedo.png");
    model.normalMap = loadTexture(path + "/normal.png");
    model.metallicMap = loadTexture(path + "/metallic.png");
    model.roughnessMap = loadTexture(path + "/roughness.png");
    model.aoMap = loadTexture(path + "/ao.png");

    model.draw = function () {
        // bind with textures
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.albedoMap);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.normalMap);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.metallicMap);

        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, this.roughnessMap);

        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, this.aoMap);

        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vboElement);
        gl.drawElements(gl.TRIANGLES, this.numElements, gl.UNSIGNED_INT, 0);
        gl.bindVertexArray(null);
    }

    return model;
}

function loadModel2(mdl, path) {
    var model = {};

    // pyramid Position
    var vertices = new Float32Array(mdl.vertex);
    var indices = new Uint32Array(mdl.index);
    model.numElements = mdl.index.length;

    model.vao = gl.createVertexArray();
    gl.bindVertexArray(model.vao);

    model.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_VERTEX,
        3, // 3 for x,y,z axes in vertex array
        gl.FLOAT,
        false, // is normalized?
        16 * 4, 0 * 4); // stride and offset
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_VERTEX);

    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_NORMAL,
        3, // 3 for x,y,z axes in vertex array
        gl.FLOAT,
        false, // is normalized?
        16 * 4, 3 * 4); // stride and offset
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_NORMAL);

    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_TEXCOORD0,
        2, // 2 for s,t axes in vertex array
        gl.FLOAT,
        false, // is normalized?
        16 * 4, 6 * 4); // stride and offset
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_TEXCOORD0);

    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_BONEIDS,
        4, //
        gl.FLOAT,
        false,
        16 * 4, 8 * 4); // stride and offset
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_BONEIDS);

    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_BONEWEIGHTS,
        4, // 
        gl.FLOAT,
        false, // is normalized?
        16 * 4, 12 * 4); // stride and offset
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_BONEWEIGHTS);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    model.vboElement = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.vboElement);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);

    vertices.length = [];
    indices.length = [];
    mdl.vertex.length = [];
    mdl.index.length = [];

    model.frontTex = loadTexture(path + "/front.png");
    model.backTex = loadTexture(path + "/back.png");

    model.draw = function () {
        // bind with textures
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.frontTex);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.backTex);

        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vboElement);
        gl.drawElements(gl.TRIANGLES, this.numElements, gl.UNSIGNED_INT, 0);
        gl.bindVertexArray(null);
    }

    return model;
}
