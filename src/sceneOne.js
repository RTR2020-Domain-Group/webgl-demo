'use strict';

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

    trees: [],
    //animation/update variables

    //johnny
    johnny_posX: -35.0,
    johnny_posZ: 0.0,
    johnny_rot: 10.0,
    johnny_walk_speed: 2.0,

    //extra man 1
    man1_posX: 35.0,
    man1_posZ: 205.0,
    man1_rot: 0.0,
    man1_walk_speed: 0.2,

    //boy
    boy_posX: 63.0,
    boy_posZ: 257.0,
    boy_walk_speed: 0.2,

    //father
    father_posX: 35.0,
    father_posZ: 265.0,
    father_walk_speed: 0.19,

    //extra man 2
    man2_posX: 65.0,
    man2_posZ: 530.0,
    man2_rot: 0.0,
    man2_walk_speed: 0.2,

    //businessman
    bman_posX: 46.5,
    bman_posZ: 608.2,
    //bman_posX: 46.3,
    //bman_posZ: 608.1,
    bman_walk_speed: 0.2,

    // camera
    angle: 0.0,
    bottleMode: UP,

    pitch0: 0.0,
    pitch1: 0.0,
    yaw0: 0.0,
    yaw1: 0.0,
    pos0: [],
    pos1: [],

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

        this.pos0 = [-3.28, 8.06, -22.98];
        this.pos1 = [1.46, 6.06, 0.97];

        this.lightPos = [-89.70, 187.96, 157.38];
        var lightPosv4 = [-89.70, 187.96, 157.38, 1.0];

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
        gl.uniform4fv(u.light_position, lightPosv4);
        gl.useProgram(null);

        /**
         * TREE 
         */
        var treeShader = TreeShader.use();

        let s = 0;
        let pos = 0;
        var n = new Tree(null, null, gl);

        //this.trees.push(n);

        //First Tree
        n = new Tree(12, null, gl)
        this.trees.push(n);

        //2nd Position
        pos = MOV(0.50, 0, 7.5);
        s = 1.4 + 1.6 * Math.pow(Math.random(), 4);
        this.trees.push(new Tree(10, SIZE(s, s, s).compose(pos), gl));

        pos = MOV(2.5, 0, 7.5);
        s = 1.4 + 1.6 * Math.pow(Math.random(), 4);
        this.trees.push(new Tree(10, SIZE(s, s, s).compose(pos), gl));

        //3rd Position
        pos = MOV(1.0, 0, 11.5);
        s = 1.4 + 1.6 * Math.pow(Math.random(), 4);
        this.trees.push(new Tree(10, SIZE(s, s, s).compose(pos), gl));

        pos = MOV(2.5, 0, 11.5);
        s = 1.4 + 1.6 * Math.pow(Math.random(), 4);
        this.trees.push(new Tree(10, SIZE(s, s, s).compose(pos), gl));


        pos = MOV(0.55, 0, 15.5);
        s = 1.2 + 1.1 * Math.pow(Math.random(), 4);
        this.trees.push(new Tree(10, SIZE(s, s, s).compose(pos), gl));

        pos = MOV(3.0, 0, 20.0);
        s = 1.6 + 1.6 * Math.pow(Math.random(), 4);
        this.trees.push(new Tree(10, SIZE(s, s, s).compose(pos), gl));

        pos = MOV(3.5, 0, 25.0);
        s = 1.4 + 1.2 * Math.pow(Math.random(), 4);
        this.trees.push(new Tree(10, SIZE(s, s, s).compose(pos), gl));


        /*for (var i = 2; i < 11; i++) {
            s = 0.4 + 0.6 * Math.pow(Math.random(), 4);
            pos = MOV((i * 0.05) * Math.sin(i), 0, (i * 0.05) * Math.cos(i))
            this.trees.push(new Tree(10, SIZE(s, s, s).compose(pos), gl));
        }*/

        //set rotation
        gl.uniform1f(treeShader.t, 10000);

        gl.useProgram(null);

        this.terrain = generateTerrain(256, 256, 100);

        this.johnny = loadModel(jwModel, "res/models/johnny");
        this.bottles = loadModel(bottlesModel, "res/models/bottles");
        this.bottles0 = loadModel(bottlesModel0, "res/models/bottles");
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

        this.photograph = loadModel2(photographModel0, "res/models/photograph");
        this.newspaper = loadModel2(newspaperModel0, "res/models/newspaper");

        this.fbo = createFramebuffer(1920, 1080);
        this.noise = createNoiseTexture();

        this.shadowFB = createShadowFramebuffer();

        this.texMask = loadTexture("res/textures/terrain/mask.png");
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
        mat4.ortho(this.lightProjectionMatrix, -400.0, 400.0, -400.0, 400.0, 0.0, 600.0);
        this.lightViewMatrix = mat4.create();
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
        // mat4.perspective(this.lightProjectionMatrix, 45.0, parseFloat(canvas.width) / parseFloat(canvas.height), 0.1, 1000);
    },

    display: function () {

        /// 1st pass for shadow map /////////////////////////
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadowFB.FBO);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, DEPTH_MAP_SIZE, DEPTH_MAP_SIZE);

        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

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
        gl.viewport(0, 0, canvas.width, canvas.height);

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
        // this.t += 1;
        this.t = frameCount;

        //johnny
        if (this.t >= 1132 && this.t <= 2011) {
            this.johnny_posZ += this.johnny_walk_speed;
        }
        else if (this.t >= 2720 && this.t <= 3207) {
            this.johnny_posZ += this.johnny_walk_speed;
            this.johnny_posX += 0.2;
            this.johnny_rot += 0.001;
        }

        else if (this.t >= 4784 && this.t <= 5475) {
            this.johnny_posZ += this.johnny_walk_speed;
            //this.johnny_posX -= 0.005;
            this.johnny_rot -= 0.005;
        }

        else if (this.t >= 5862 && this.t <= 6101) {
            this.johnny_posZ += this.johnny_walk_speed;
            this.johnny_posX -= 0.05;
            this.johnny_rot -= 0.003;
        }

        else if (this.t >= 6622 && this.t <= 7351) {
            this.johnny_posZ += this.johnny_walk_speed;
            this.johnny_rot -= 0.0029;
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

        //extra man1
        if (this.t >= 1888 && this.t <= 2057) {
            this.man1_posZ -= this.man1_walk_speed;
        }

        else if (this.t >= 2310 && this.t <= 3287) {
            this.man1_posZ -= this.man1_walk_speed;
            this.man1_posX -= 0.035;
            this.man1_rot -= 0.005;
        }

        //boy
        if (this.t >= 4638 && this.t <= 5623) {
            this.boy_posZ += this.boy_walk_speed;
        }

        //father
        if (this.t >= 4620 && this.t <= 5621) {
            this.father_posZ += this.father_walk_speed;
            this.father_posX -= 0.005;
        }

        //man2
        if (this.t >= 5854 && this.t <= 6221) {
            this.man2_posZ -= this.man2_walk_speed;
        }

        else if (this.t >= 6562 && this.t <= 7565) {
            this.man2_posZ -= this.man2_walk_speed;
            this.man2_rot -= 0.005;
        }

        //bman
        if (this.t >= 11192 && this.t <= 11741) {
            this.bman_posZ -= this.bman_walk_speed;
            this.bman_posX += 0.001;
        }

        //credits fade in
        if (this.t >= 11620) {
            this.currentTexture = 4;
            this.alphaBlending += 0.04;
            if (this.alphaBlending >= 1.0) {
                this.alphaBlending = 1.0;
                return true;
            }
        }

        ///// camera animation /////////////////////////////////////////////////
        // spin around johnny
        if (this.t >= 930 && this.t < 1132) {
            camera.Position[0] += (this.pos1[0] - this.pos0[0]) / (1132 - 930);
            camera.Position[1] += (this.pos1[1] - this.pos0[1]) / (1132 - 930);
            camera.Position[2] += (this.pos1[2] - this.pos0[2]) / (1132 - 930);
            if (camera.Yaw >= -105.0) {
                camera.Yaw -= 2.0;
            }
            camera.updateCameraVectors();
        }
        // follow jonny from front
        else if (this.t >= 1132 && this.t < 1860) {
            camera.Position[0] += 0.04;
            camera.Position[2] += 0.21;
        }
        // spin around again
        else if (this.t >= 1860 && this.t < 2011) {
            if (camera.Yaw >= -285.0) {
                camera.Position[0] -= 0.06;
                camera.Position[2] -= 0.15;
                camera.Yaw -= 2.0;
                camera.updateCameraVectors();
            }
        }

        // // move to first man
        // //else if (this.t >= 2011 && this.t < 2100) {
        // // camera.moveDir(FORWARD, 0.15);
        // //}

        // move to the boy and father
        else if (this.t >= 2720 && this.t < 3050) {
            camera.moveDir(FORWARD, 0.2);

            // next position
            this.pos0 = camera.Position;
            this.pos1 = vec3.fromValues(40.06, 2.70, 271.72);
            this.pitch0 = camera.Pitch;
            this.yaw0 = camera.Yaw;
            this.pitch1 = 0.25;
            this.yaw1 = -20.0;

            if (this.t == 3049) {
                console.log('camera old', camera.Position);
                console.log('camera old yaw', camera.Yaw);
                console.log('camera old pitch', camera.Pitch);
            }
        }
        // close up on boy father and johnny
        else if (this.t >= 3050 && this.t < 3151) {

            // 44.47, 6.05, 203.46
            // yaw -287
            // pitch 0

            // 40.06, 2.70, 271.72
            // yaw -20.0
            // pitch 0.25

            // camera.Position = this.pos1;
            camera.Pitch += 0.0025;
            camera.Yaw -= 0.93;

            camera.Position[0] -= 0.045;
            camera.Position[1] -= 0.033;
            camera.Position[2] += 0.682;

            camera.updateCameraVectors();
        }

        // zoom slowly
        else if (this.t >= 3207 && this.t < 3208) {
            camera.moveDir(FORWARD, 0.05);
        }
        // boy and father walks away, rotate camera towards them
        else if (this.t >= 4784 && this.t < 5000) {
            camera.Yaw += 90.0 * (1.0 / (5000 - 4784));
            camera.Pitch -= 1.0 / (5000 - 4784);

            camera.updateCameraVectors();
        }
        // move camera towards johnny
        else if (this.t >= 5000 && this.t < 5475) {
            camera.Position[2] += 0.2;

            if (this.t == 5474) {
                console.log('camera', camera.Position);
                console.log('camera Pitch', camera.Pitch);
                console.log('camera Yaw', camera.Yaw);
            }
        }
        // rotate camera around johnny
        else if (this.t >= 5475 && this.t < 5575) {

            // position [39.97, 2.72, 367.33]
            // Yaw - 290.92
            // Pitch - 0.74

            // rotate around johnny camera:
            // position [58.83, 4.59, 413.50]
            // Yaw 264.75
            // Pitch 3.00

            // top view camera
            // position = [87.47, 12.43, 437.05];
            // yaw = 210.0;
            // pitch = -20.0;

            // 100 frames
            camera.Yaw += 180.0 / 100.0;
            camera.Pitch -= (-0.74 - 3.00) / 100.0;

            camera.Position[0] += (58.83 - 39.97) / 100.0;
            camera.Position[1] += (4.59 - 2.72) / 100.0;
            camera.Position[2] += (413.50 - 367.33) / 100.0;

            camera.updateCameraVectors();
        }
        // move camera up
        else if (this.t >= 5712 && this.t < 5862) {

            // rotate around johnny camera:
            // position [58.83, 4.59, 413.50]
            // Yaw 264.75
            // Pitch 3.00

            // top view camera
            // position = [87.47, 12.43, 437.05];
            // yaw = 210.0;
            // pitch = -20.0;

            camera.Yaw -= 54.0 / 150.0;
            camera.Pitch -= (3.00 + 20.0) / 150.0;

            camera.Position[0] += (87.47 - 58.83) / 150.0;
            camera.Position[1] += (12.43 - 4.59) / 150.0;
            camera.Position[2] += (437.05 - 413.50) / 150.0;

            camera.updateCameraVectors();
        }

        // Position
        // Float32Array(3)[61.09038543701172, 9.558198928833008, 426.5563049316406]
        // camera.js: 124: 17
        // Front
        // Float32Array(3)[-0.19353078305721283, -0.061004988849163055, -0.9791957139968872]
        // camera.js: 125: 17
        // Right
        // Float32Array(3)[0.9810228943824768, 0, -0.19389191269874573]
        // camera.js: 126: 17
        // Yaw - 461.1799999999966 camera.js: 127: 17
        // Pitch - 3.4975000000000023


        // close up johnny
        // else if (this.t >= 5475 && this.t < 5476) {
        //     camera.Position = vec3.fromValues(87.47, 12.43, 437.05);
        //     camera.Yaw = 210.0;
        //     camera.Pitch = -20.0;

        //     camera.updateCameraVectors();

        // }

        // follow johnny 
        else if (this.t >= 5862 && this.t < 6101) {
            camera.Position[2] += 0.1;
        }
        // follow johnny
        else if (this.t >= 6622 && this.t < 7351) {
            camera.Position[2] += 0.185;
            camera.Yaw -= 0.06;
        }
        // close up sad man
        else if (this.t >= 7490 && this.t < 7491) {
            camera.Position = vec3.fromValues(61.82, 4.33, 605.46);
            camera.Yaw = 45.75;
            camera.Pitch = -14.25;

            camera.updateCameraVectors();
        }
        // close up to business man and johnny
        else if (this.t >= 7750 && this.t < 7751) {
            camera.Position = vec3.fromValues(72.92, 4.59, 600.45);
            camera.Yaw = -180.0;
            camera.Pitch = -7.5;

            camera.updateCameraVectors();
        }
        // close up to businessmap champi
        else if (this.t >= 9600 && this.t < 9601) {
            camera.Position = vec3.fromValues(56.69, 5.35, 608.78);
            camera.Yaw = -180.0;
            camera.Pitch = 5.5;

            camera.updateCameraVectors();
        }
        // businessman stands up
        else if (this.t >= 10800 && this.t < 10801) {
            camera.Position = vec3.fromValues(47.82, 9.61, 631.83);
            camera.Yaw = -100.0;
            camera.Pitch = -7.75;

            camera.updateCameraVectors();
        }
        // businessman walks away
        else if (this.t >= 11192 && this.t < 11741) {
            camera.moveDir(FORWARD, 0.01);
            camera.Yaw -= 0.01;
            camera.updateCameraVectors();
        }

        //// johnny model bottle orientation 
        this.bottleMode = UP;
        if (this.t >= 0 && this.t < 950) {
            this.bottleMode = DOWN;
        } else if (this.t >= 1710 && this.t < 2630) {
            this.bottleMode = DOWN;
        } else if (this.t >= 4740 && this.t < 5460) {
            this.bottleMode = DOWN;
        } else if (this.t >= 6120 && this.t < 6570) {
            this.bottleMode = DOWN;
        } else if (this.t >= 8228 && this.t < 9100) {
            this.bottleMode = DOWN;
        } else if (this.t >= 9600) {
            this.bottleMode = 0;
        }

        return false;
    },

    drawModels: function (shadow) {

        //TREES
        /*********************************************** */

        var treeShader = TreeShader.use();

        var modelMatrix = mat4.create();
        var viewMatrix = mat4.create();

        mat4.translate(modelMatrix, modelMatrix, [-25.0, 10.0, 0.0]);
        mat4.scale(modelMatrix, modelMatrix, [30.4, 30.4, 30.4]);
        viewMatrix = camera.getViewMatrix();
        //set rotation
        gl.uniform1f(treeShader.t, 10000);
        gl.uniformMatrix4fv(treeShader.mUniform, false, modelMatrix);

        if (shadow) {
            gl.uniformMatrix4fv(treeShader.pUniform, false, this.lightProjectionMatrix);
            gl.uniformMatrix4fv(treeShader.vUniform, false, this.lightViewMatrix);
        } else {
            gl.uniformMatrix4fv(treeShader.vUniform, false, viewMatrix);
            gl.uniformMatrix4fv(treeShader.pUniform, false, this.perspectiveProjectionMatrix);
        }
        gl.disable(gl.CULL_FACE);
        this.trees.map(i => drawTree(i));
        gl.enable(gl.CULL_FACE);

        gl.useProgram(null);


        //animated models
        /************************************************************************************************************************************/

        modelMatrix = mat4.create();
        viewMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [0.0, -2.0, -15.0]);
        mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 0.1]);

        var cLookAtPoint = camera.getCameraLookPoint();
        var lightPoint = [cLookAtPoint[0] + this.lightPos[0], cLookAtPoint[1] + this.lightPos[1], cLookAtPoint[2] + this.lightPos[2]];
        mat4.lookAt(this.lightViewMatrix, lightPoint, cLookAtPoint, [0.0, 1.0, 0.0]);
        viewMatrix = camera.getViewMatrix();

        var u;
        if (shadow) {
            u = PBRshaderWhite.use();
            gl.uniformMatrix4fv(u.pUniform, false, this.lightProjectionMatrix);
            viewMatrix = this.lightViewMatrix;
        } else {
            u = PBRshader.use();
            var m = mat4.create();
            mat4.multiply(m, this.lightProjectionMatrix, this.lightViewMatrix);
            mat4.multiply(m, this.lightBiasMatrix, m);

            gl.uniform1i(u.uShadow, 1);
            gl.uniformMatrix4fv(u.uShadowMatrix, false, m);

            gl.activeTexture(gl.TEXTURE5);
            gl.bindTexture(gl.TEXTURE_2D, this.shadowFB.texDepth);
            gl.uniform1i(u.uShadowMap, 5);

            gl.uniformMatrix4fv(u.pUniform, false, this.perspectiveProjectionMatrix);
        }

        mat4.rotateY(modelMatrix, modelMatrix, toRadians(this.johnny_rot));
        mat4.translate(modelMatrix, modelMatrix, [this.johnny_posX, -7.0, this.johnny_posZ]);
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.vUniform, false, viewMatrix);
        gl.uniformMatrix4fv(u.boneMatrixUniform, gl.FALSE, jwAnim[this.t]);
        gl.disable(gl.CULL_FACE);
        this.johnny.draw();
        gl.enable(gl.CULL_FACE);

        modelMatrix = mat4.create();
        mat4.rotateY(modelMatrix, modelMatrix, toRadians(this.man1_rot));
        mat4.translate(modelMatrix, modelMatrix, [this.man1_posX, -3.5, this.man1_posZ]);
        mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 0.1]);
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.boneMatrixUniform, gl.FALSE, extraMan1Anim0[Math.min(this.t, extraMan1Anim0.length - 1)]);
        if (this.t >= 1800 && this.t <= 3300) {
            this.extraMan1.draw();
        }

        modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [this.boy_posX, -4.0, this.boy_posZ]);
        mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 0.1]);
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.boneMatrixUniform, gl.FALSE, boyAnim[Math.min(this.t, boyAnim.length - 1)]);
        if (this.t >= 0 && this.t <= 5625) {
            this.boy.draw();
        }

        modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [this.father_posX, -4.8, this.father_posZ]);
        mat4.translate(modelMatrix, modelMatrix, [25.0, 0.0, 0.0]);
        mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 0.1]);
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.boneMatrixUniform, gl.FALSE, fatherAnim[Math.min(this.t, fatherAnim.length - 1)]);
        if (this.t >= 0 && this.t <= 5625) {
            this.father.draw();
        }

        modelMatrix = mat4.create();
        mat4.rotateY(modelMatrix, modelMatrix, toRadians(this.man2_rot));
        mat4.translate(modelMatrix, modelMatrix, [this.man2_posX, -3.5, this.man2_posZ]);
        mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 0.1]);
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.boneMatrixUniform, gl.FALSE, extraMan2Anim0[Math.min(this.t, extraMan2Anim0.length - 1)]);
        if (this.t >= 5800 && this.t <= 7600) {
            this.extraMan20.draw();
            this.extraMan21.draw();
            this.extraMan22.draw();
            this.extraMan23.draw();
            this.extraMan24.draw();
            this.extraMan25.draw();
        }

        modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [83.0, -4.0, 620.0]);
        mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 0.1]);
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.boneMatrixUniform, gl.FALSE, sadManAnim0[Math.min(this.t, sadManAnim0.length - 1)]);
        this.sadMan0.draw();
        this.sadMan1.draw();
        this.sadMan2.draw();
        this.sadMan3.draw();
        this.sadMan4.draw();

        modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [this.bman_posX, -5.5, this.bman_posZ]);
        mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 0.1]);
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.boneMatrixUniform, gl.FALSE, businessmanAnim0[Math.min(this.t, businessmanAnim0.length - 1)]);
        this.bman0.draw();
        this.bman1.draw();

        gl.useProgram(null);

        /************************************************************************************************************************************/


        //static models
        /************************************************************************************************************************************/

        if (shadow) {
            u = PBRStaticShaderWhite.use();
            gl.uniformMatrix4fv(u.pUniform, false, this.lightProjectionMatrix);
            viewMatrix = this.lightViewMatrix;
        } else {
            u = PBRStaticShader.use();
            var m = mat4.create();
            mat4.multiply(m, this.lightProjectionMatrix, this.lightViewMatrix);
            mat4.multiply(m, this.lightBiasMatrix, m);

            gl.uniformMatrix4fv(u.uShadowMatrix, false, m);

            gl.activeTexture(gl.TEXTURE5);
            gl.bindTexture(gl.TEXTURE_2D, this.shadowFB.texDepth);
            gl.uniform1i(u.uShadowMap, 5);

            gl.uniformMatrix4fv(u.pUniform, false, this.perspectiveProjectionMatrix);
        }

        gl.uniformMatrix4fv(u.vUniform, false, viewMatrix);

        //light poles

        //right side
        modelMatrix = mat4.create();
        var bMat = mat4.create();
        mat4.translate(bMat, modelMatrix, [-20.0, -9.0, 0.0]);
        mat4.scale(bMat, bMat, [0.075, 0.075, 0.075]);
        mat4.rotateX(bMat, bMat, toRadians(-90.0));
        gl.uniformMatrix4fv(u.mUniform, false, bMat);
        gl.uniformMatrix4fv(u.boneUniform, false, mat4.create());
        this.lightPole.draw();

        modelMatrix = mat4.create();
        var bMat = mat4.create();
        mat4.translate(bMat, modelMatrix, [12.0, -9.0, 200.0]);
        mat4.scale(bMat, bMat, [0.075, 0.075, 0.075]);
        mat4.rotateX(bMat, bMat, toRadians(-90.0));
        gl.uniformMatrix4fv(u.mUniform, false, bMat);
        gl.uniformMatrix4fv(u.boneUniform, false, mat4.create());
        this.lightPole.draw();

        modelMatrix = mat4.create();
        var bMat = mat4.create();
        mat4.translate(bMat, modelMatrix, [30.0, -9.0, 400.0]);
        mat4.scale(bMat, bMat, [0.075, 0.075, 0.075]);
        mat4.rotateX(bMat, bMat, toRadians(-90.0));
        gl.uniformMatrix4fv(u.mUniform, false, bMat);
        gl.uniformMatrix4fv(u.boneUniform, false, mat4.create());
        this.lightPole.draw();

        modelMatrix = mat4.create();
        var bMat = mat4.create();
        mat4.translate(bMat, modelMatrix, [40.0, -9.0, 630.0]);
        mat4.scale(bMat, bMat, [0.075, 0.075, 0.075]);
        mat4.rotateX(bMat, bMat, toRadians(-90.0));
        gl.uniformMatrix4fv(u.mUniform, false, bMat);
        gl.uniformMatrix4fv(u.boneUniform, false, mat4.create());
        this.lightPole.draw();

        modelMatrix = mat4.create();
        var bMat = mat4.create();
        mat4.translate(bMat, modelMatrix, [36.0, -9.0, 830.0]);
        mat4.scale(bMat, bMat, [0.075, 0.075, 0.075]);
        mat4.rotateX(bMat, bMat, toRadians(-90.0));
        gl.uniformMatrix4fv(u.mUniform, false, bMat);
        gl.uniformMatrix4fv(u.boneUniform, false, mat4.create());
        this.lightPole.draw();

        //left side
        modelMatrix = mat4.create();
        var bMat = mat4.create();
        mat4.translate(bMat, modelMatrix, [50.0, -9.0, 100.0]);
        mat4.scale(bMat, bMat, [0.075, 0.075, 0.075]);
        mat4.rotateX(bMat, bMat, toRadians(-90.0));
        mat4.rotateZ(bMat, bMat, toRadians(180.0));
        gl.uniformMatrix4fv(u.mUniform, false, bMat);
        gl.uniformMatrix4fv(u.boneUniform, false, mat4.create());
        this.lightPole.draw();

        modelMatrix = mat4.create();
        var bMat = mat4.create();
        mat4.translate(bMat, modelMatrix, [72.0, -9.0, 300.0]);
        mat4.scale(bMat, bMat, [0.075, 0.075, 0.075]);
        mat4.rotateX(bMat, bMat, toRadians(-90.0));
        mat4.rotateZ(bMat, bMat, toRadians(180.0));
        gl.uniformMatrix4fv(u.mUniform, false, bMat);
        gl.uniformMatrix4fv(u.boneUniform, false, mat4.create());
        this.lightPole.draw();

        modelMatrix = mat4.create();
        var bMat = mat4.create();
        mat4.translate(bMat, modelMatrix, [90.0, -9.0, 500.0]);
        mat4.scale(bMat, bMat, [0.075, 0.075, 0.075]);
        mat4.rotateX(bMat, bMat, toRadians(-90.0));
        mat4.rotateZ(bMat, bMat, toRadians(180.0));
        gl.uniformMatrix4fv(u.mUniform, false, bMat);
        gl.uniformMatrix4fv(u.boneUniform, false, mat4.create());
        this.lightPole.draw();

        modelMatrix = mat4.create();
        var bMat = mat4.create();
        mat4.translate(bMat, modelMatrix, [90.0, -9.0, 730.0]);
        mat4.scale(bMat, bMat, [0.075, 0.075, 0.075]);
        mat4.rotateX(bMat, bMat, toRadians(-90.0));
        mat4.rotateZ(bMat, bMat, toRadians(180.0));
        gl.uniformMatrix4fv(u.mUniform, false, bMat);
        gl.uniformMatrix4fv(u.boneUniform, false, mat4.create());
        this.lightPole.draw();

        modelMatrix = mat4.create();
        var bMat = mat4.create();
        mat4.translate(bMat, modelMatrix, [86.0, -9.0, 930.0]);
        mat4.scale(bMat, bMat, [0.075, 0.075, 0.075]);
        mat4.rotateX(bMat, bMat, toRadians(-90.0));
        mat4.rotateZ(bMat, bMat, toRadians(180.0));
        gl.uniformMatrix4fv(u.mUniform, false, bMat);
        gl.uniformMatrix4fv(u.boneUniform, false, mat4.create());
        this.lightPole.draw();

        //benches

        //father & son
        bMat = mat4.create();
        modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [61.0, -3.0, 254.0]);
        mat4.scale(modelMatrix, modelMatrix, [0.004, 0.004, 0.004]);
        mat4.rotateX(modelMatrix, modelMatrix, toRadians(0.0));
        mat4.rotateY(modelMatrix, modelMatrix, toRadians(10.0));
        mat4.rotateZ(modelMatrix, modelMatrix, toRadians(11.0));
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.boneUniform, false, mat4.create());
        this.bench.draw();
        this.bench1.draw();

        //vacant
        bMat = mat4.create();
        modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [20.0, -3.0, 254.0]);
        mat4.scale(modelMatrix, modelMatrix, [0.004, 0.004, 0.004]);
        mat4.rotateX(modelMatrix, modelMatrix, toRadians(0.0));
        mat4.rotateY(modelMatrix, modelMatrix, toRadians(8.0));
        mat4.rotateZ(modelMatrix, modelMatrix, toRadians(11.0));
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.boneUniform, false, mat4.create());
        this.bench.draw();
        this.bench1.draw();

        //sad man
        bMat = mat4.create();
        modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [80.0, -2.8, 613.0]);
        mat4.scale(modelMatrix, modelMatrix, [0.004, 0.004, 0.004]);
        mat4.rotateX(modelMatrix, modelMatrix, toRadians(2.0));
        mat4.rotateY(modelMatrix, modelMatrix, toRadians(5.0));
        mat4.rotateZ(modelMatrix, modelMatrix, toRadians(11.0));
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.boneUniform, false, mat4.create());
        this.bench.draw();
        this.bench1.draw();

        //sad man vacant
        bMat = mat4.create();
        modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [79.0, -2.6, 596.0]);
        mat4.scale(modelMatrix, modelMatrix, [0.004, 0.004, 0.004]);
        mat4.rotateX(modelMatrix, modelMatrix, toRadians(2.0));
        mat4.rotateY(modelMatrix, modelMatrix, toRadians(5.0));
        mat4.rotateZ(modelMatrix, modelMatrix, toRadians(11.0));
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.boneUniform, false, mat4.create());
        this.bench.draw();
        this.bench1.draw();

        //bman
        bMat = mat4.create();
        modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [44.0, -4.0, 602.0]);
        mat4.scale(modelMatrix, modelMatrix, [0.004, 0.004, 0.004]);
        mat4.rotateX(modelMatrix, modelMatrix, toRadians(0.0));
        mat4.rotateY(modelMatrix, modelMatrix, toRadians(0.0));
        mat4.rotateZ(modelMatrix, modelMatrix, toRadians(11.0));
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.boneUniform, false, mat4.create());
        this.bench.draw();
        this.bench1.draw();

        //johnny
        bMat = mat4.create();
        modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [44.0, -4.0, 585.0]);
        mat4.scale(modelMatrix, modelMatrix, [0.004, 0.004, 0.004]);
        mat4.rotateX(modelMatrix, modelMatrix, toRadians(0.0));
        mat4.rotateY(modelMatrix, modelMatrix, toRadians(0.0));
        mat4.rotateZ(modelMatrix, modelMatrix, toRadians(11.0));
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.boneUniform, false, mat4.create());
        this.bench.draw();
        this.bench1.draw();


        var rightHand = jwAnim[this.t].slice((23 * 16), (24 * 16));
        modelMatrix = mat4.create();
        if (this.bottleMode == DOWN) {
            mat4.translate(modelMatrix, modelMatrix, [-0.2, -2.0, -15.0]);
        } else {
            mat4.translate(modelMatrix, modelMatrix, [0.0, -2.0, -15.0]);
        }
        mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 0.1]);
        mat4.rotateY(modelMatrix, modelMatrix, toRadians(this.johnny_rot));
        mat4.translate(modelMatrix, modelMatrix, [this.johnny_posX, -7.0, this.johnny_posZ]);

        gl.uniformMatrix4fv(u.boneUniform, false, rightHand);
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        if (this.bottleMode == UP) {
            this.bottles.draw();
        } else if (this.bottleMode == DOWN) {
            this.bottles0.draw();
        }
        gl.useProgram(null);

        // photograph and newspaper models
        gl.disable(gl.CULL_FACE);
        u = TwoSidedTextureShader.use();
        gl.uniformMatrix4fv(u.vUniform, false, viewMatrix);
        
        if (shadow) {
            gl.uniformMatrix4fv(u.pUniform, false, this.lightProjectionMatrix);
        } else {
            gl.uniformMatrix4fv(u.pUniform, false, this.perspectiveProjectionMatrix);
        }
        
        modelMatrix = mat4.create();
        //mat4.multiply(modelMatrix, modelMatrix, businessmanAnim0[Math.min(this.t, businessmanAnim0.length - 1)])
        mat4.translate(modelMatrix, modelMatrix, [this.bman_posX+5.0, 0.5, this.bman_posZ]);
        mat4.scale(modelMatrix, modelMatrix, [0.01, 0.01, 0.01]);
        mat4.rotateY(modelMatrix, modelMatrix, toRadians(angleY));
        mat4.rotateX(modelMatrix, modelMatrix, toRadians(angleX));
        
        
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        this.newspaper.draw();
        
        gl.useProgram(null);
        gl.enable(gl.CULL_FACE);
        
        /************************************************************************************************************************************/


        //terrain
        /************************************************************************************************************************************/

        if (shadow) {
            u = TerrainShaderWhite.use();
            gl.uniformMatrix4fv(u.pUniform, false, this.lightProjectionMatrix);
        } else {
            u = TerrainShader.use();
            gl.uniformMatrix4fv(u.pUniform, false, this.perspectiveProjectionMatrix);

            m = mat4.create();
            mat4.multiply(m, this.lightProjectionMatrix, this.lightViewMatrix);
            mat4.multiply(m, this.lightBiasMatrix, m);
            gl.uniformMatrix4fv(u.uShadowMatrix, false, m);

            gl.activeTexture(gl.TEXTURE7);
            gl.bindTexture(gl.TEXTURE_2D, this.shadowFB.texDepth);
            gl.uniform1i(u.uShadowMap, 7);
        }

        bMat = mat4.create();
        modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [10.0, -12.0, -15.0]);
        mat4.scale(modelMatrix, modelMatrix, [10.0, 10.0, 10.0]);
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.vUniform, false, viewMatrix);
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

var angleY = 90.0;
var angleX = 45.0;