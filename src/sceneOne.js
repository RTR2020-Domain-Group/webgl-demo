var sceneOne = {
    johnny: 0,
    bottles: 0,

    perspectiveProjectionMatrix: mat4.create(),

    bLight: false,
    bLoadSkybox: false,
    t: 0,
    numElements: 0,

    fbo: 0,

    init: function () {

        var u = PBRshader.use();

        // set light
        gl.uniform3fv(u.lightPositionUniform, [7.0 * Math.cos(3.7), 0.0, 7.0 * Math.sin(3.7)]);
        gl.uniform3fv(u.lightColorUniform, [150.0, 150.0, 150.0]);

        gl.useProgram(null);

        this.johnny = loadModel(jwModel, "res/models/johnny");
        this.bottles = loadModel(bottlesModel, "res/models/bottles");

        this.fbo = createFramebuffer(1920, 1080);
    },

    uninit: function () {
        gl.deleteFramebuffer(this.fbo.FBO);
    },

    resize: function () {
        // perspective projection
        mat4.perspective(this.perspectiveProjectionMatrix, 45.0, parseFloat(canvas.width) / parseFloat(canvas.height), 0.1, 1000);
    },

    display: function () {
        // bind FBO for post processing
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo.FBO);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(SkyboxShader.shaderProgramObject);

        var modelMatrix = mat4.create();
        var viewMatrix = mat4.create();

        var skyboxModelViewMatrix = mat4.create();
        var skyboxModelViewProjectionMatrix = mat4.create();

        mat4.translate(modelMatrix, modelMatrix, [0.0, 1.0, 0.0]);
        mat4.translate(skyboxModelViewMatrix, skyboxModelViewMatrix, [0.0, 0.0, -3.5]);

        mat4.multiply(skyboxModelViewProjectionMatrix, this.perspectiveProjectionMatrix, camera.getViewMatrixNoTranslate());
        gl.uniformMatrix4fv(SkyboxShader.gMVPMatrixUniform, false, skyboxModelViewProjectionMatrix);

        //TODO: (RRB) This is hack and confusing code change, we need to use something else if we get bandwidth
        if (SkyboxShader.gct == 6 && !this.bLoadSkybox) {
            this.bLoadSkybox = true;
            SkyboxShader.generateSkybox();
        }

        if (SkyboxShader.skybox_texture && this.bLoadSkybox) {
            gl.depthMask(false);
            gl.bindVertexArray(SkyboxShader.gVao);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, SkyboxShader.skybox_texture);
            gl.drawArrays(gl.TRIANGLES, 0, 36);
            gl.bindVertexArray(null);
            gl.depthMask(true);
        }

        gl.useProgram(null);

        var modelMatrix = mat4.create();
        var viewMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [0.0, -2.0, -15.0]);
        mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 0.1]);

        viewMatrix = camera.getViewMatrix();

        // var u = PBRStaticShader.use();
        var u = PBRshader.use();
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.vUniform, false, viewMatrix);
        gl.uniformMatrix4fv(u.pUniform, false, this.perspectiveProjectionMatrix);
        gl.uniformMatrix4fv(u.boneMatrixUniform, gl.FALSE, jwAnim[this.t]);

        this.johnny.draw();
        gl.useProgram(null);

        u = PBRStaticShader.use();
        modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [0.0, -2.0, -15.0]);
        mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 0.1]);
        // mat4.multiply(modelMatrix, modelMatrix, jwAnim[this.t].slice((45*16),(46*16)));

        var m = mat4.create();
        mat4.scale(m, m, [10.0, 10.0, 10.0]);

        gl.uniformMatrix4fv(u.boneUniform, false, m);
        // gl.uniformMatrix4fv(u.boneUniform, false, jwAnim[this.t].slice((23 * 16), (24 * 16)));
        //gl.uniformMatrix4fv(u.boneUniform, false, mat4.create());
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.vUniform, false, viewMatrix);
        gl.uniformMatrix4fv(u.pUniform, false, this.perspectiveProjectionMatrix);
        this.bottles.draw();
        gl.useProgram(null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // post processing
        gl.depthMask(false);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.fbo.texColor);
        GrainShader.use();
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        gl.useProgram(null);
        gl.depthMask(true);
    },

    update: function () {
        this.t += 1;
        if (this.t >= jwAnim.length) {
            this.t = 0.0;
            // return true;
        }

        if (this.t >= 100) {
            // return true;
        }
        return false;
    },
}

// 45 bone id for right hand bottles tracking
//