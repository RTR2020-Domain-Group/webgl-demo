var sceneOne = {
    terrain: 0,
    johnny: 0,
    bottles: 0,
    boy: 0,
    father: 0,
    bench: 0,
    bench1: 0,

    perspectiveProjectionMatrix: mat4.create(),
    infProjectionMatrix: mat4.create(),

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
        this.bench = loadModel(benchModel, "res/models/bench/0");
        this.bench1 = loadModel(benchModel1, "res/models/bench/1");
        this.bman0 = loadModel(businessmanModel0, "res/models/businessman/0");
        this.bman1 = loadModel(businessmanModel1, "res/models/businessman/1");
        this.extraMan1 = loadModel(extraMan1Model0, "res/models/extraMan1");
        this.extraMan20 = loadModel(extraMan2Model0, "res/models/extraMan2/0");
        this.extraMan21 = loadModel(extraMan2Model1, "res/models/extraMan2/1");
        this.extraMan22 = loadModel(extraMan2Model2, "res/models/extraMan2/2");
        this.extraMan23 = loadModel(extraMan2Model3, "res/models/extraMan2/3");
        this.extraMan24 = loadModel(extraMan2Model4, "res/models/extraMan2/4");
        this.extraMan25 = loadModel(extraMan2Model5, "res/models/extraMan2/5");

        this.fbo = createFramebuffer(1920, 1080);
        this.noise = createNoiseTexture();

        //this.grassTex = loadTexture("res/textures/grass.png");
        this.grassTex = loadTexture("res/textures/GroundDiffuse.png");
        this.grassHeight = loadTexture("res/textures/GroundBump.png");

    },

    uninit: function () {
        gl.deleteFramebuffer(this.fbo.FBO);
    },

    resize: function () {
        // perspective projection
        mat4.perspective(this.perspectiveProjectionMatrix, 45.0, parseFloat(canvas.width) / parseFloat(canvas.height), 0.1, 1000);
        mat4.perspective(this.infProjectionMatrix, 45.0, parseFloat(canvas.width) / parseFloat(canvas.height), 0.1, 1000);
        this.infProjectionMatrix[10] = 0.00001 - 1.0;
        this.infProjectionMatrix[14] = (0.00001 - 2.0) * 0.1;
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
        mat4.translate(modelMatrix, modelMatrix, [1.0, 1.0, 150.0]);
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

        modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [0.0, -2.0, -15.0]);
        mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 0.1]);
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.boneMatrixUniform, gl.FALSE, businessmanAnim0[Math.min(this.t, businessmanAnim0.length - 1)]);
        this.bman0.draw();
        this.bman1.draw();

        modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [10.0, -2.0, -15.0]);
        mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 0.1]);
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.boneMatrixUniform, gl.FALSE, extraMan1Anim0[Math.min(this.t, extraMan1Anim0.length - 1)]);
        this.extraMan1.draw();

        modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [0.0, -2.0, -15.0]);
        mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 0.1]);
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.boneMatrixUniform, gl.FALSE, extraMan2Anim0[Math.min(this.t, extraMan2Anim0.length - 1)]);
        this.extraMan20.draw();
        this.extraMan21.draw();
        this.extraMan22.draw();
        this.extraMan23.draw();
        this.extraMan24.draw();
        this.extraMan25.draw();

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
        gl.uniform1f(u.uTiling, 10.0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.grassHeight);
        gl.uniform1i(u.hMap, 0);
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
        if (play) { this.t += 1; }
        if (this.t >= jwAnim.length) {
            this.t = 0.0;
            // return true;
        }

        if (this.t >= 100) {
            // return true;
        }
        // camera.moveDir(FORWARD, 0.5);
        return false;
    },
}
