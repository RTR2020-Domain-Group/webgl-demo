var sceneOne = {
    terrain: 0,
    johnny: 0,
    bottles: 0,
    boy: 0,
    father: 0,
    bench: 0,
    bench1: 0,

    perspectiveProjectionMatrix: mat4.create(),

    bLight: false,
    bLoadSkybox: false,
    t: 0,
    numElements: 0,

    fbo: 0,
    noise: 0,

    init: function () {

        var u = PBRshader.use();

        // set light
        gl.uniform3fv(u.lightPositionUniform, [7.0 * Math.cos(3.7), 0.0, 7.0 * Math.sin(3.7)]);
        gl.uniform3fv(u.lightColorUniform, [150.0, 150.0, 150.0]);

        gl.useProgram(null);

        u = PBRStaticShader.use();

        // set light
        gl.uniform3fv(u.lightPositionUniform, [7.0 * Math.cos(3.7), 0.0, 7.0 * Math.sin(3.7)]);
        gl.uniform3fv(u.lightColorUniform, [150.0, 150.0, 150.0]);

        gl.useProgram(null);

        this.terrain = generateTerrain(256, 256, 100);

        this.johnny = loadModel(jwModel, "res/models/johnny");
        this.bottles = loadModel(bottlesModel, "res/models/bottles");
        this.boy = loadModel(boyModel, "res/models/boy");
        this.father = loadModel(fatherModel, "res/models/father");
        this.lightPole = loadModel(lightPoleModel, "res/models/lightPole");
        this.bench = loadModel(benchModel, "res/models/bench");
        this.bench1 = loadModel(benchModel1, "res/models/bench");
        this.bman0 = loadModel(businessmanModel0, "res/models/businessman");
        this.bman1 = loadModel(businessmanModel1, "res/models/businessman");

        this.fbo = createFramebuffer(1920, 1080);
        this.noise = createNoiseTexture();

        this.grassTex = loadTexture("res/textures/grass.png");
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

        var bMat = mat4.create();
        mat4.translate(bMat, modelMatrix, [-10.0, 0.0, 0.0]);
        gl.uniformMatrix4fv(u.mUniform, false, bMat);
        gl.uniformMatrix4fv(u.boneMatrixUniform, gl.FALSE, boyAnim[Math.min(this.t, boyAnim.length - 1)]);
        this.boy.draw();

        bMat = mat4.create();
        //mat4.multiply(modelMatrix, modelMatrix, fatherModel.invTransform);
        mat4.translate(modelMatrix, modelMatrix, [0.0, -2.0, -15.0]);
        mat4.translate(bMat, modelMatrix, [25.0, 0.0, 0.0]);
        gl.uniformMatrix4fv(u.mUniform, false, bMat);
        gl.uniformMatrix4fv(u.boneMatrixUniform, gl.FALSE, fatherAnim[Math.min(this.t, fatherAnim.length - 1)]);
        this.father.draw();

        gl.useProgram(null);

        u = PBRStaticShader.use();

        bMat = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [0.0, -2.0, -15.0]);
        mat4.translate(bMat, modelMatrix, [35.0, 0.0, 0.0]);
        mat4.rotateX(bMat, bMat, toRadians(-90.0));
        gl.uniformMatrix4fv(u.mUniform, false, bMat);
        gl.uniformMatrix4fv(u.boneUniform, false, mat4.create());
        this.lightPole.draw();

        bMat = mat4.create();
        modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [0.0, -2.0, -15.0]);
        mat4.scale(modelMatrix, modelMatrix, [0.005, 0.005, 0.005]);
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.boneUniform, false, mat4.create());
        this.bench.draw();
        this.bench1.draw();

        bMat = mat4.create();
        modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [10.0, -2.0, -15.0]);
        mat4.scale(modelMatrix, modelMatrix, [0.008, 0.008, 0.008]);
        mat4.rotateX(modelMatrix, modelMatrix, toRadians(-90.0));
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.boneUniform, false, mat4.create());
        this.bman0.draw();
        this.bman1.draw();

        modelMatrix = mat4.create();
        mat4.multiply(modelMatrix, modelMatrix, bottlesModel.invTransform);
        mat4.rotateY(modelMatrix, modelMatrix, toRadians(90.0));
        mat4.translate(modelMatrix, modelMatrix, [-2.0, 4.0, -4.0]);
        //mat4.scale(modelMatrix, modelMatrix, [10.0, 10.0, 10.0]);
        // mat4.multiply(modelMatrix, modelMatrix, jwAnim[this.t].slice((45*16),(46*16)));

        var m = mat4.create();
        var rightHand = jwAnim[this.t].slice((45 * 16), (46 * 16));
        rightHand[0] = 1.0;
        rightHand[1] = 0.0;
        rightHand[2] = 0.0;
        rightHand[3] = 0.0;

        rightHand[0 + 4] = 0.0;
        rightHand[1 + 4] = 1.0;
        rightHand[2 + 4] = 0.0;
        rightHand[3 + 4] = 0.0;

        rightHand[0 + 8] = 0.0;
        rightHand[1 + 8] = 0.0;
        rightHand[2 + 8] = 1.0;
        rightHand[3 + 8] = 0.0;

        // rightHand[0+12] *= 0.1;
        // rightHand[1+12] *= 0.1;
        // rightHand[2+12] *= 0.1;
        // rightHand[3+12] = 0.0;

        //mat4.scale(m, rightHand, [-50.0, 50.0, -50.0]);

        gl.uniformMatrix4fv(u.boneUniform, false, rightHand);
        //gl.uniformMatrix4fv(u.boneUniform, false, jwAnim[this.t].slice((23 * 16), (24 * 16)));
        //gl.uniformMatrix4fv(u.boneUniform, false, mat4.create());
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.vUniform, false, viewMatrix);
        gl.uniformMatrix4fv(u.pUniform, false, this.perspectiveProjectionMatrix);
        this.bottles.draw();
        gl.useProgram(null);

        u = TerrainShader.use();
        bMat = mat4.create();
        modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [10.0, -2.0, -15.0]);
        // mat4.scale(modelMatrix, modelMatrix, [100.0, 100.0, 100.0]);
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.vUniform, false, viewMatrix);
        gl.uniformMatrix4fv(u.pUniform, false, this.perspectiveProjectionMatrix);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.grassTex);
        gl.uniform1i(u.sampler, 1);
        this.terrain.draw();

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
        camera.moveDir(FORWARD, 0.5);
        return false;
    },
}

// 45 bone id for right hand bottles tracking
//