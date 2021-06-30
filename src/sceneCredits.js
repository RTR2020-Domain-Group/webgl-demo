var sceneCredits = {
    vaoQuad: 0,
    vboQuadPosition: 0,
    vboQuadTexcoord: 0,
    vboQuadNormal: 0,

    perspectiveProjectionMatrix: mat4.create(),

    songCredits_t4: 0,
    effects_t5: 0,
    techRef_t6: 0,
    groupMembers_t7: 0,
    mamAndSir_t8: 0,
    end_t9: 0,

    alphaBlending: 1.0,
    currentTexture: 4,
    timer: 0.0,

    init: function () {

        var credits = CreditsShader.use();

        //ARRAYS

        var quadVertices = new Float32Array([
            0.85, 0.5, 0.0,
            -0.85, 0.5, 0.0,
            -0.85, -0.5, 0.0,
            0.85, -0.5, 0.0
        ]);


        var quadTexcoords = new Float32Array([
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,
            1.0, 0.0
        ]);


        var quadNormals = new Float32Array([
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0
        ]);


        this.vaoQuad = gl.createVertexArray();
        gl.bindVertexArray(this.vaoQuad);

        this.vboQuadPosition = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboQuadPosition);
        gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_VERTEX, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_VERTEX);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.vboQuadTexcoord = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboQuadTexcoord);
        gl.bufferData(gl.ARRAY_BUFFER, quadTexcoords, gl.STATIC_DRAW);
        gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_TEXCOORD0, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_TEXCOORD0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.vboQuadNormal = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboQuadNormal);
        gl.bufferData(gl.ARRAY_BUFFER, quadNormals, gl.STATIC_DRAW);
        gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_NORMAL, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_NORMAL);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindVertexArray(null);

        //load textures

        this.songCredits_t4 = loadTexture("res/textures/credits/4.SongCredits.png");
        this.effects_t5 = loadTexture("res/textures/credits/4a.Effects.png");
        this.techRef_t6 = loadTexture("res/textures/credits/5.TechnicalReferences.png");
        this.groupMembers_t7 = loadTexture("res/textures/credits/6.GroupMembers.png");
        this.mamAndSir_t8 = loadTexture("res/textures/credits/7.MamAndSir.png");
        this.end_t9 = loadTexture("res/textures/credits/8.TheEnd.png");



        gl.useProgram(null);

        this.fbo = createFramebuffer(1920, 1080);
        this.noise = createNoiseTexture();

    },

    uninit: function () {
        gl.deleteTexture(this.songCredits_t4);
        gl.deleteTexture(this.songCredits_t5);
        gl.deleteTexture(this.techRef_t6);
        gl.deleteTexture(this.groupMembers_t7);
        gl.deleteTexture(this.mamAndSir_t8);
        gl.deleteTexture(this.end_t9);

        if (this.vaoQuad) {
            gl.deleteVertexArray(this.vaoQuad);
            this.vaoQuad = null;
        }

        if (this.vboQuadPosition) {
            gl.deleteBuffer(this.vboQuadPosition);
            this.vboQuadPosition = null;
        }

        if (this.vboQuadTexcoord) {
            gl.deleteBuffer(this.vboQuadTexcoord);
            this.vboQuadTexcoord = null;
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
        // bind FBO for post processing
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo.FBO);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, canvas.width, canvas.height);

        var credits = CreditsShader.use();

        gl.uniform3f(credits.lAUniform, 0.2, 0.2, 0.2);
        gl.uniform3f(credits.lDUniform, 1.0, 1.0, 1.0);
        gl.uniform3f(credits.lSUniform, 1.0, 1.0, 1.0);
        gl.uniform4f(credits.lightPositionUniform, 0.0, 0.0, 4.0, 1.0);
        gl.uniform3f(credits.lightTargetUniform, 0.0, 0.0, -1.0);
        gl.uniform1f(credits.lightCutoffUniform, 30.0);
        gl.uniform1f(credits.lightOuterCutoffUniform, 50.0);
        gl.uniform1f(credits.lightConstantUniform, 1.0);
        gl.uniform1f(credits.lightLinearUniform, 0.03);
        gl.uniform1f(credits.lightQuadraticUniform, 0.0182);

        gl.uniform1f(credits.alphaUniform, this.alphaBlending);
        gl.uniform1f(credits.kShininessUniform, 50.0);


        var modelMatrix = mat4.create();
        var viewMatrix = mat4.create();

        mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, -2.8]);
        mat4.scale(modelMatrix, modelMatrix, [3.4, 3.4, 3.4]);

        gl.uniformMatrix4fv(credits.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(credits.vUniform, false, viewMatrix);
        gl.uniformMatrix4fv(credits.pUniform, false, this.perspectiveProjectionMatrix);

        //textures

        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(credits.textureSamplerUniform, 0);

        if (this.currentTexture == 4)
            gl.bindTexture(gl.TEXTURE_2D, this.songCredits_t4);

        else if (this.currentTexture == 5)
            gl.bindTexture(gl.TEXTURE_2D, this.effects_t5);

        else if (this.currentTexture == 6)
            gl.bindTexture(gl.TEXTURE_2D, this.techRef_t6);

        else if (this.currentTexture == 7)
            gl.bindTexture(gl.TEXTURE_2D, this.groupMembers_t7);

        else if (this.currentTexture == 8)
            gl.bindTexture(gl.TEXTURE_2D, this.mamAndSir_t8);

        else if (this.currentTexture == 9)
            gl.bindTexture(gl.TEXTURE_2D, this.end_t9);


        //bind quad vao
        gl.bindVertexArray(this.vaoQuad);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

        //unbind quad vao
        gl.bindVertexArray(null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // post processing
        gl.depthMask(false);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.fbo.texColor);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.noise);

        var u = GrainShader.use();
        gl.uniform2f(u.delta, Math.random(), Math.random())
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);

        gl.useProgram(null);
        gl.depthMask(true);

    },

    update: function () {

        this.timer += 0.01;

        //song credits
        if (this.timer >= 0.0 && this.timer < 5.0) {
            this.currentTexture = 4;
            /*this.alphaBlending += 0.005;
            if (this.alphaBlending >= 1.0) {
                this.alphaBlending = 1.0;
            }*/
        }

        if (this.timer >= 5.0 && this.timer < 5.5) {
            this.alphaBlending -= 0.05;
            if (this.alphaBlending <= 0.0) {
                this.alphaBlending = 0.0;
            }
        }

        //effects
        if (this.timer >= 5.5 && this.timer < 12.0) {
            this.currentTexture = 5;
            this.alphaBlending += 0.06;
            if (this.alphaBlending >= 1.0) {
                this.alphaBlending = 1.0;
            }
        }

        if (this.timer >= 12.0 && this.timer < 12.5) {
            this.alphaBlending -= 0.08;
            if (this.alphaBlending <= 0.0) {
                this.alphaBlending = 0.0;
            }
        }

        //tech ref
        if (this.timer >= 12.5 && this.timer < 17.0) {
            this.currentTexture = 6;
            this.alphaBlending += 0.07;
            if (this.alphaBlending >= 1.0) {
                this.alphaBlending = 1.0;
            }
        }

        if (this.timer >= 17.0 && this.timer < 17.5) {
            this.alphaBlending -= 0.09;
            if (this.alphaBlending <= 0.0) {
                this.alphaBlending = 0.0;
            }
        }

        //group members
        if (this.timer >= 17.5 && this.timer < 23.0) {
            this.currentTexture = 7;
            this.alphaBlending += 0.1;
            if (this.alphaBlending >= 1.0) {
                this.alphaBlending = 1.0;
            }
        }

        if (this.timer >= 23.0 && this.timer < 23.5) {
            this.alphaBlending -= 0.12;
            if (this.alphaBlending <= 0.0) {
                this.alphaBlending = 0.0;
            }
        }

        //madam and sir
        if (this.timer >= 23.5 && this.timer < 28.5) {
            this.currentTexture = 8;
            this.alphaBlending += 0.14;
            if (this.alphaBlending >= 1.0) {
                this.alphaBlending = 1.0;
            }
        }

        if (this.timer >= 28.5 && this.timer < 29.0) {
            this.alphaBlending -= 0.16;
            if (this.alphaBlending <= 0.0) {
                this.alphaBlending = 0.0;
            }
        }

        //end
        if (this.timer >= 29.0 && this.timer < 32.0) {
            this.currentTexture = 9;
            this.alphaBlending += 0.18;
            if (this.alphaBlending >= 1.0) {
                this.alphaBlending = 1.0;
            }
        }

        if (this.timer >= 32.0) {
            this.alphaBlending -= 0.2;
            if (this.alphaBlending <= 0.0) {
                this.alphaBlending = 0.0;
            }
        }


        return false;
    },
}
