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
    t: 680,
    numElements: 0,

    fbo: 0,
    noise: 0,

    vaoQuad: 0,
    vboQuadPosition: 0,
    vboQuadTexcoord: 0,
    vboQuadNormal: 0,

    sarjotera_t3: 0,
    songCredits_t4: 0,

    alphaBlending: 1.0,
    currentTexture: 3,
    timer: 0.0,

    //animation/update variables

    //johnny
    johnny_posX: -35.0,
    johnny_posZ: 0.0,
    johnny_rot: 10.0,
    //johnny_rot_speed: 0.001,    
    johnny_walk_speed: 2.0,
    johnny_walk: false,

    //extra man 1
    man1_posX: 35.0,
    man1_posZ: 0.0,
    man1_walk_speed: 0.2,
    man1_walk: false,

    //boy
    boy_posX: 40.0,
    boy_posZ: -10.0,
    boy_walk_speed: 0.2,
    boy_walk: false,

    //father
    father_posX: 40.0,
    father_posZ: -5.0,
    father_walk_speed: 0.25,
    father_walk: false,

    //extra man 2
    man2_posX: 35.0,
    man2_posZ: 10.0,
    man2_walk_speed: 0.2,
    man2_walk: false,

    //businessman
    bman_posX: -40.0,
    bman_posZ: 0.0,
    bman_walk_speed: 0.2,
    bman_walk: false,

    init: function () {

        //credits   
        /************************************************************************************************************************************/
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
        this.sarjotera_t3 = loadTexture("res/textures/credits/3.SarJoTeraChakraye.png");
        this.songCredits_t4 = loadTexture("res/textures/credits/4.SongCredits.png");

        gl.useProgram(null);

        /************************************************************************************************************************************/

        this.lightPos = [10.0, 100.0, -100];

        var u = PBRshader.use();

        // set light
        gl.uniform3fv(u.lightPositionUniform, this.lightPos);
        gl.uniform3fv(u.lightColorUniform, [1.0, 1.0, 1.0]);

        gl.useProgram(null);

        u = PBRStaticShader.use();

        // set light
        gl.uniform3fv(u.lightPositionUniform, this.lightPos);
        gl.uniform3fv(u.lightColorUniform, [1.0, 1.0, 1.0]);

        gl.useProgram(null);

        u = TerrainShader.use();
        gl.uniform4fv(u.light_position, [10.0, 100.0, -100, 1.0]);
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

        this.sadMan0 = loadModel(sadManModel0, "res/models/sadMan/0");
        this.sadMan1 = loadModel(sadManModel1, "res/models/sadMan/1");
        this.sadMan2 = loadModel(sadManModel2, "res/models/sadMan/2");
        this.sadMan3 = loadModel(sadManModel3, "res/models/sadMan/3");
        this.sadMan4 = loadModel(sadManModel4, "res/models/sadMan/4");

        this.fbo = createFramebuffer(1920, 1080);
        this.noise = createNoiseTexture();

        this.shadowFB = createShadowFramebuffer();

        this.texMask = loadTexture("res/textures/terrain/mask2.png");
        this.texGrass = loadTexture("res/textures/terrain/gDiff.png");
        this.texRoad = loadTexture("res/textures/terrain/BricksDiffuse.png");
        this.texGrassBump = loadTexture("res/textures/terrain/gDisp.png");
        this.texRoadBump = loadTexture("res/textures/terrain/BricksBump.png");
        this.texGrassNorm = loadTexture("res/textures/terrain/gNorm.png");
        this.texRoadNorm = loadTexture("res/textures/terrain/BricksNormal.png");

        this.dx = 0;
        this.lightProjectionMatrix = mat4.create();
        this.lightBiasMatrix = mat4.fromValues(
            0.5, 0.0, 0.0, 0.0,
            0.0, 0.5, 0.0, 0.0,
            0.0, 0.0, 0.5, 0.0,
            0.5, 0.5, 0.5, 1.0);
        mat4.perspective(this.lightProjectionMatrix, 45.0, 1.0, 0.1, 1000);


    },

    uninit: function () {
        gl.deleteFramebuffer(this.fbo.FBO);

        gl.deleteTexture(this.sarjotera_t3);
        gl.deleteTexture(this.songCredits_t4);

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
    },

    resize: function () {
        // perspective projection
        mat4.perspective(this.perspectiveProjectionMatrix, 45.0, parseFloat(canvas.width) / parseFloat(canvas.height), 0.1, 1000);
    },

    display: function () {

        /// 1st pass for shadow map /////////////////////////
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadowFB.FBO);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        mat4.perspective(this.perspectiveProjectionMatrix, 45.0, 1.0, 0.1, 1000);

        // enable polygon offset to resolve depth-fighting issues
        gl.enable(gl.POLYGON_OFFSET_FILL);
        gl.polygonOffset(2.0, 4.0);

        this.drawModels(true);

        gl.disable(gl.POLYGON_OFFSET_FILL);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        /// 2nd pass for actual drawing /////////////////////////
        // bind FBO for post processing
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo.FBO);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        mat4.perspective(this.perspectiveProjectionMatrix, 45.0, parseFloat(canvas.width) / parseFloat(canvas.height), 0.1, 1000);

        //skybox
        /************************************************************************************************************************************/

        gl.useProgram(SkyboxShader.shaderProgramObject);

        var skyboxModelViewProjectionMatrix = mat4.create();

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

        /************************************************************************************************************************************/


        this.drawModels(false);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        /************************************************************************************************************************************/


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


        //credits 
        /************************************************************************************************************************************/

        var credits = CreditsShader.use();

        gl.uniform3f(credits.lAUniform, 0.2, 0.2, 0.2);
        gl.uniform3f(credits.lDUniform, 1.0, 1.0, 1.0);
        gl.uniform3f(credits.lSUniform, 1.0, 1.0, 1.0);
        gl.uniform4f(credits.lightPositionUniform, 0.0, 0.0, 4.0, 1.0);
        gl.uniform3f(credits.lightTargetUniform, 0.0, 0.0, -1.0);
        gl.uniform1f(credits.lightCutoffUniform, 10.0);
        gl.uniform1f(credits.lightOuterCutoffUniform, 11.0);
        gl.uniform1f(credits.lightConstantUniform, 1.0);
        gl.uniform1f(credits.lightLinearUniform, 0.09);
        gl.uniform1f(credits.lightQuadraticUniform, 0.032);

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

        if (this.currentTexture == 3)
            gl.bindTexture(gl.TEXTURE_2D, this.sarjotera_t3);

        else if (this.currentTexture == 4)
            gl.bindTexture(gl.TEXTURE_2D, this.songCredits_t4);


        //bind quad vao
        gl.bindVertexArray(this.vaoQuad);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

        //unbind quad vao
        gl.bindVertexArray(null);

        gl.useProgram(null);

        /************************************************************************************************************************************/

    },

    update: function () {

        this.timer += 0.01;

        //credits fade out
        if (this.timer >= 0.0) {
            this.currentTexture = 3;
            this.alphaBlending -= 0.025;
            if (this.alphaBlending <= 0.0) {
                this.alphaBlending = 0.0;
            }
        }

        //main scene
        this.t += 1;

        //johnny
        if (this.t >= 1132 && this.t <= 2011) {
            this.johnny_posZ += this.johnny_walk_speed;
        }

        else if (this.t >= 2012 && this.t <= 2719) {
            //console.log("Extra man 1 ", this.johnny_posZ);
        }

        else if (this.t >= 2720 && this.t <= 3207) {
            this.johnny_posZ += this.johnny_walk_speed;
            this.johnny_posX += 0.2;
            this.johnny_rot += 0.001;
        }

        else if (this.t >= 3208 && this.t <= 4783) {
            //console.log("Boy & Father ", this.johnny_posZ);
        }

        else if (this.t >= 4784 && this.t <= 5475) {
            this.johnny_posZ += this.johnny_walk_speed;
            //this.johnny_posX -= 0.005;
            this.johnny_rot -= 0.005;
        }

        else if (this.t >= 5476 && this.t <= 5861) {
            //console.log("Halt ", this.johnny_posZ);
        }

        else if (this.t >= 5862 && this.t <= 6101) {
            this.johnny_posZ += this.johnny_walk_speed;
            this.johnny_posX -= 0.05;
            this.johnny_rot -= 0.003;
        }

        else if (this.t >= 6102 && this.t <= 6621) {
            //console.log("Extra man 2 ", this.johnny_posZ);
        }

        else if (this.t >= 6622 && this.t <= 7351) {
            this.johnny_posZ += this.johnny_walk_speed;
            this.johnny_rot -= 0.0029;
        }

        else if (this.t >= 7352 && this.t <= 9307) {
            //console.log("B-Man & Sad Man ", this.johnny_posZ);
        }

        /////////johnny around bench
        else if (this.t >= 9308 && this.t <= 9345) {
            this.johnny_posZ -= this.johnny_walk_speed;
        }

        else if (this.t >= 9346 && this.t <= 9385) {
            this.johnny_posX -= this.johnny_walk_speed;
        }

        else if (this.t >= 9386 && this.t <= 9513) {
            this.johnny_posZ += this.johnny_walk_speed;
        }

        else if (this.t >= 9514) {

        }

        //extra man1

        if (this.man1_walk == true) {
            this.man1_posZ -= this.man1_walk_speed;
        }

        if (this.t >= 1888) {
            this.man1_walk = true;
        }

        if (this.t >= 2058) {
            this.man1_walk = false;
        }

        if (this.t >= 2310) {
            this.man1_walk = true;
        }

        if (this.t >= 3288) {
            this.man1_walk = false;
        }


        //boy

        if (this.boy_walk == true) {
            this.boy_posZ += this.boy_walk_speed;
        }

        if (this.t >= 4638) {
            this.boy_walk = true;
        }

        if (this.t >= 5624) {
            this.boy_walk = false;
        }

        //father

        if (this.father_walk == true) {
            this.father_posZ += this.father_walk_speed;
        }

        if (this.t >= 4620) {
            this.father_walk = true;
        }

        if (this.t >= 5622) {
            this.father_walk = false;
        }

        //man2

        if (this.man2_walk == true) {
            this.man2_posZ -= this.man2_walk_speed;
        }

        if (this.t >= 5854) {
            this.man2_walk = true;
        }

        if (this.t >= 6222) {
            this.man2_walk = false;
        }

        if (this.t >= 6562) {
            this.man2_walk = true;
        }

        if (this.t >= 7566) {
            this.man2_walk = false;
        }


        //bman

        if (this.bman_walk == true) {
            this.bman_posZ -= this.bman_walk_speed;
        }

        if (this.t >= 11192) {
            this.bman_walk = true;
        }

        if (this.t >= 11742) {
            this.bman_walk = false;
        }

        //credits fade in
        if (this.t >= 11628) {
            this.currentTexture = 4;
            this.alphaBlending += 0.04;
            if (this.alphaBlending >= 1.0) {
                this.alphaBlending = 1.0;
                return true;
            }
        }


        // camera.moveDir(FORWARD, 0.5);
        return false;
    },

    drawModels: function (shadow) {
        //animated models
        /************************************************************************************************************************************/

        var modelMatrix = mat4.create();
        var viewMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [0.0, -2.0, -15.0]);
        mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 0.1]);

        if (shadow) {
            mat4.lookAt(viewMatrix, this.lightPos, [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
        } else {
            viewMatrix = camera.getViewMatrix();
        }

        var u;
        if (shadow) {
            u = PBRshaderWhite.use();
        } else {
            u = PBRshader.use();
            var m = mat4.create();
            mat4.multiply(m, this.lightProjectionMatrix, viewMatrix);
            mat4.multiply(m, this.lightBiasMatrix, m);

            gl.uniform1i(u.uShadow, 1);
            gl.uniformMatrix4fv(u.uShadowMatrix, false, m);

            gl.activeTexture(gl.TEXTURE5);
            gl.bindTexture(gl.TEXTURE_2D, this.shadowFB.texDepth);
            gl.uniform1i(u.uShadowMap, 5);
        }

        mat4.translate(modelMatrix, modelMatrix, [this.johnny_posX, 0.0, this.johnny_posZ]);
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.vUniform, false, viewMatrix);
        gl.uniformMatrix4fv(u.pUniform, false, this.perspectiveProjectionMatrix);
        gl.uniformMatrix4fv(u.boneMatrixUniform, gl.FALSE, jwAnim[this.t]);
        this.johnny.draw();


        modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [this.man1_posX, 0.0, this.man1_posZ]);
        mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 0.1]);
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.boneMatrixUniform, gl.FALSE, extraMan1Anim0[Math.min(this.t, extraMan1Anim0.length - 1)]);
        this.extraMan1.draw();


        //var bMat = mat4.create();
        modelMatrix = mat4.create();
        //mat4.translate(bMat, modelMatrix, [-10.0, 0.0, 0.0]);
        mat4.translate(modelMatrix, modelMatrix, [this.boy_posX, 0.0, this.boy_posZ]);
        mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 0.1]);
        //gl.uniformMatrix4fv(u.mUniform, false, bMat);
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.boneMatrixUniform, gl.FALSE, boyAnim[Math.min(this.t, boyAnim.length - 1)]);
        this.boy.draw();


        //bMat = mat4.create();
        modelMatrix = mat4.create();
        //mat4.multiply(modelMatrix, modelMatrix, fatherModel.invTransform);
        //mat4.translate(modelMatrix, modelMatrix, [0.0, -2.0, -15.0]);
        mat4.translate(modelMatrix, modelMatrix, [this.father_posX, -2.0, this.father_posZ]);
        mat4.translate(modelMatrix, modelMatrix, [25.0, 0.0, 0.0]);
        mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 0.1]);
        //gl.uniformMatrix4fv(u.mUniform, false, bMat);
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.boneMatrixUniform, gl.FALSE, fatherAnim[Math.min(this.t, fatherAnim.length - 1)]);
        this.father.draw();


        modelMatrix = mat4.create();
        //mat4.translate(modelMatrix, modelMatrix, [0.0, -2.0, -15.0]);
        mat4.translate(modelMatrix, modelMatrix, [this.man2_posX, -2.0, this.man2_posZ]);
        mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 0.1]);
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.boneMatrixUniform, gl.FALSE, extraMan2Anim0[Math.min(this.t, extraMan2Anim0.length - 1)]);
        this.extraMan20.draw();
        this.extraMan21.draw();
        this.extraMan22.draw();
        this.extraMan23.draw();
        this.extraMan24.draw();
        this.extraMan25.draw();


        modelMatrix = mat4.create();
        //mat4.translate(modelMatrix, modelMatrix, [0.0, -2.0, -15.0]);
        mat4.translate(modelMatrix, modelMatrix, [this.sadman_posX, -2.0, this.sadman_posZ]);
        mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 0.1]);
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.boneMatrixUniform, gl.FALSE, sadManAnim0[Math.min(this.t, sadManAnim0.length - 1)]);
        this.sadMan0.draw();
        this.sadMan1.draw();
        this.sadMan2.draw();
        this.sadMan3.draw();
        this.sadMan4.draw();


        modelMatrix = mat4.create();
        //mat4.translate(modelMatrix, modelMatrix, [0.0, -2.0, -15.0]);
        mat4.translate(modelMatrix, modelMatrix, [this.bman_posX, -2.0, this.bman_posZ]);
        mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 0.1]);
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.boneMatrixUniform, gl.FALSE, businessmanAnim0[Math.min(this.t, businessmanAnim0.length - 1)]);
        this.bman0.draw();
        this.bman1.draw();


        gl.useProgram(null);

        /************************************************************************************************************************************/


        //static models
        /************************************************************************************************************************************/

        u = PBRStaticShader.use();
        gl.uniformMatrix4fv(u.vUniform, false, viewMatrix);
        gl.uniformMatrix4fv(u.pUniform, false, this.perspectiveProjectionMatrix);

        modelMatrix = mat4.create();
        bMat = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [0.0, -2.0, -15.0]);
        //mat4.translate(bMat, modelMatrix, [35.0, 0.0, 0.0]);
        mat4.scale(bMat, bMat, [0.075, 0.075, 0.075]);
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



        var rightHand = jwAnim[this.t].slice((23 * 16), (24 * 16));
        modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [0.0, -2.0, -15.0]);
        mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 0.1]);
        mat4.translate(modelMatrix, modelMatrix, [this.johnny_posX, 0.0, this.johnny_posZ]);

        gl.uniformMatrix4fv(u.boneUniform, false, rightHand);
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        this.bottles.draw();

        gl.useProgram(null);

        /************************************************************************************************************************************/


        //terrain
        /************************************************************************************************************************************/

        u = TerrainShader.use();
        bMat = mat4.create();
        modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [10.0, -12.0, -15.0]);
        mat4.scale(modelMatrix, modelMatrix, [10.0, 10.0, 10.0]);
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.vUniform, false, viewMatrix);
        gl.uniformMatrix4fv(u.pUniform, false, this.perspectiveProjectionMatrix);
        gl.uniform1f(u.uTiling, 200.0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texMask);
        gl.uniform1i(u.uMask, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.texGrass);
        gl.uniform1i(u.uGrass, 1);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.texRoad);
        gl.uniform1i(u.uRoad, 2);

        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, this.texGrassBump);
        gl.uniform1i(u.uGrassBump, 3);
        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, this.texRoadBump);
        gl.uniform1i(u.uRoadBump, 4);

        gl.activeTexture(gl.TEXTURE5);
        gl.bindTexture(gl.TEXTURE_2D, this.texGrassNorm);
        gl.uniform1i(u.uGrassNorm, 5);
        gl.activeTexture(gl.TEXTURE6);
        gl.bindTexture(gl.TEXTURE_2D, this.texRoadNorm);
        gl.uniform1i(u.uRoadNorm, 6);

        this.terrain.draw();
    }
}

var x = 0.0, y = 40.0, z = 1.0;
var rX = 0, rY = 0, rZ = 0;