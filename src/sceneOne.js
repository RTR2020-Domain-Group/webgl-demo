var sceneOne = {
    vaoCube: 0,
    vboCube: 0,
    vboElement: 0,

    albedoMap: 0,
    normalMap: 0,
    metallicMap: 0,
    roughnessMap: 0,
    aoMap: 0,

    perspectiveProjectionMatrix: mat4.create(),

    bLight: false,
    t: 0,
    numElements: 0,

    init: function () {

        var u = PBRshader.use();

        // set light
        gl.uniform3fv(u.lightPositionUniform, [7.0 * Math.cos(3.7), 0.0, 7.0 * Math.sin(3.7)]);
        gl.uniform3fv(u.lightColorUniform, [150.0, 150.0, 150.0]);

        gl.useProgram(null);

        // pyramid Position
        var cubeVertices = new Float32Array(jwModel.vertex);
        var cubeIndices = new Uint32Array(jwModel.index);
        this.numElements = jwModel.index.length;

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);

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

        this.vboElement = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vboElement);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeIndices, gl.STATIC_DRAW);

        gl.bindVertexArray(null);

        this.albedoMap = loadTexture("res/johnny/albedo.png");
        this.normalMap = loadTexture("res/johnny/normal.png");
        this.metallicMap = loadTexture("res/johnny/metallic.png");
        this.roughnessMap = loadTexture("res/johnny/roughness.png");
        this.aoMap = loadTexture("res/johnny/ao.png");
    },

    uninit: function () {
        gl.deleteTexture(this.albedoMap);
        gl.deleteTexture(this.normalMap);
        gl.deleteTexture(this.metallicMap);
        gl.deleteTexture(this.roughnessMap);
        gl.deleteTexture(this.aoMap);

        if (this.vaoCube) {
            gl.deleteVertexArray(this.vaoCube);
            this.vaoCube = null;
        }

        if (this.vboCube) {
            gl.deleteBuffer(this.vboCube);
            this.vboCube = null;
        }

        if (this.vboElement) {
            gl.deleteBuffer(this.vboElement);
            this.vboElement = null;
        }

        if (this.shaderProgramObject) {
            if (this.fragmentShaderObject) {
                gl.detachShader(this.shaderProgramObject, this.fragmentShaderObject);
                gl.deleteShader(this.fragmentShaderObject);
                this.fragmentShaderObject = null;
            }

            if (this.vertexShaderObject) {
                gl.detachShader(this.shaderProgramObject, this.vertexShaderObject);
                gl.deleteShader(this.vertexShaderObject);
                this.vertexShaderObject = null;
            }

            gl.deleteProgram(this.shaderProgramObject);
            this.shaderProgramObject = null;
        }
    },

    resize: function () {
        // perspective projection
        mat4.perspective(this.perspectiveProjectionMatrix, 45.0, parseFloat(canvas.width) / parseFloat(canvas.height), 0.1, 1000);
    },

    display: function () {

        var modelMatrix = mat4.create();
        var viewMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [0.0, -2.0, -15.0]);
        mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 0.1]);

        viewMatrix = camera.getViewMatrix();

        var u = PBRshader.use();
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.vUniform, false, viewMatrix);
        gl.uniformMatrix4fv(u.pUniform, false, this.perspectiveProjectionMatrix);

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

        gl.uniformMatrix4fv(u.boneMatrixUniform, gl.FALSE, jwAnim[this.t]);

        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vboElement);
        gl.drawElements(gl.TRIANGLES, this.numElements, gl.UNSIGNED_INT, 0);
        gl.bindVertexArray(null);
        gl.useProgram(null);
    },

    update: function () {
        this.t += 1;
        if (this.t >= jwAnim.length) {
            this.t = 0.0;
            // return true;
        }
        return false;
    },
}
