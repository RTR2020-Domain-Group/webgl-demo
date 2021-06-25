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

    init: function () {

        //credits   
        /***************************************************************************************/
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

        /***************************************************************************************/
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

        /**
         * TREE 
         */
        var treeShader = TreeShader.use();
        var n = new Tree(null, null, gl)
        this.trees.push(n);

        //set rotation
        gl.uniform1f(treeShader.t, 10000);

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

        //this.grassTex = loadTexture("res/textures/grass.png");
        this.grassTex = loadTexture("res/textures/GroundDiffuse.png");
        this.grassHeight = loadTexture("res/textures/GroundBump.png");

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

        modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [0.0, -2.0, -15.0]);
        mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 0.1]);
        gl.uniformMatrix4fv(u.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(u.boneMatrixUniform, gl.FALSE, sadManAnim0[Math.min(this.t, sadManAnim0.length - 1)]);
        this.sadMan0.draw();
        this.sadMan1.draw();
        this.sadMan2.draw();
        this.sadMan3.draw();
        this.sadMan4.draw();

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
        //mat4.multiply(modelMatrix, modelMatrix, bottlesModel.invTransform);
        mat4.rotateY(modelMatrix, modelMatrix, toRadians(90.0));
        mat4.translate(modelMatrix, modelMatrix, [-2.0, 4.0, -4.0]);
        //mat4.scale(modelMatrix, modelMatrix, [10.0, 10.0, 10.0]);
        // mat4.multiply(modelMatrix, modelMatrix, jwAnim[this.t].slice((45*16),(46*16)));

        var m = mat4.create();
        var rightHand = jwAnim[this.t].slice((45 * 16), (46 * 16));
        // rightHand[0] = 1.0;
        // rightHand[1] = 0.0;
        // rightHand[2] = 0.0;
        // rightHand[3] = 0.0;

        // rightHand[0 + 4] = 0.0;
        // rightHand[1 + 4] = 1.0;
        // rightHand[2 + 4] = 0.0;
        // rightHand[3 + 4] = 0.0;

        // rightHand[0 + 8] = 0.0;
        // rightHand[1 + 8] = 0.0;
        // rightHand[2 + 8] = 1.0;
        // rightHand[3 + 8] = 0.0;

        // rightHand[0+12] *= 0.1;
        // rightHand[1+12] *= 0.1;
        // rightHand[2+12] *= 0.1;
        // rightHand[3+12] = 0.0;

        //mat4.scale(m, rightHand, [-50.0, 50.0, -50.0]);
        modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [0.0, -2.0, -15.0]);
        mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 0.1]);
        mat4.translate(modelMatrix, modelMatrix, [1.0, 1.0, 150.0]);
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
        mat4.translate(modelMatrix, modelMatrix, [10.0, -12.0, -15.0]);
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


        var treeShader = TreeShader.use();
       
        //set rotation
        gl.uniform1f(treeShader.t, 10000);
        
        //drawTree(this.trees[0]);

        this.trees.map(i => drawTree(i));

        gl.useProgram(null);


        //credits 
        /***********************************************************************************************/
       
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

        /***********************************************************************************************/


    },

    update: function () {

        //this.timer += 0.01;
         //credits fade out
        if (this.timer >= 0.0){
            this.currentTexture = 3;
            this.alphaBlending -= 0.025;
            if (this.alphaBlending <= 0.0) {
                this.alphaBlending = 0.0;
            }
		}


        //main scene
        //this.t += 1;
        /*if (this.t >= jwAnim.length) {
            this.t = 0.0;
            // return true;
        }*/


        //credits fade in
        if (this.t >= 100){
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
}
