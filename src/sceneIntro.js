var sceneIntro = {
    vaoQuad: 0,
    vboQuadPosition: 0,
    vboQuadTexcoord: 0,
    vboQuadNormal: 0,

    perspectiveProjectionMatrix: mat4.create(),

    astromedicomp_t1: 0,
    domain_t2: 0,
    sarjotera_t3: 0,

    alphaBlending: 1.0,
    currentTexture: 0,
    timer: 0.0,

    init: function () {

        var credits = CreditsShader.use();

        //ARRAYS

	    var quadVertices = new Float32Array([	 0.85, 0.5, 0.0,        //front
											    -0.85, 0.5, 0.0,
											    -0.85, -0.5, 0.0,
											     0.85, -0.5, 0.0	]);


	    var quadTexcoords = new Float32Array([	1.0, 1.0,        //front
											    0.0, 1.0,
											    0.0, 0.0,
											    1.0, 0.0	]);


	    var quadNormals = new Float32Array([	0.0, 0.0, 1.0,
											    0.0, 0.0, 1.0,
											    0.0, 0.0, 1.0,
											    0.0, 0.0, 1.0	]);

        
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

	    this.astromedicomp_t1 = loadTexture("res/textures/credits/Astromedicomp.png");
	    this.domain_t2 = loadTexture("res/textures/credits/DomainGroup.png");
	    this.sarjotera_t3 = loadTexture("res/textures/credits/SarJoTeraChakraye.png");

        gl.useProgram(null);

    },

    uninit: function () {
        gl.deleteTexture(this.astromedicomp_t1);
        gl.deleteTexture(this.domain_t2);
        gl.deleteTexture(this.sarjotera_t3);
    

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

	    if(this.currentTexture == 1)
		    gl.bindTexture(gl.TEXTURE_2D, this.astromedicomp_t1);

	    else if(this.currentTexture == 2)
		    gl.bindTexture(gl.TEXTURE_2D, this.domain_t2);

	    else if(this.currentTexture == 3)
		    gl.bindTexture(gl.TEXTURE_2D, this.sarjotera_t3);
       
     
        //bind quad vao
	    gl.bindVertexArray(this.vaoQuad);

	    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

	    //unbind quad vao
	    gl.bindVertexArray(null);

 
    },

    update: function () {
       
       this.timer += 0.01;

       if (this.timer >= 0.0)
		    this.currentTexture = 1;

	    if (this.timer >= 2.0)
		    this.currentTexture = 2;

	    if (this.timer >= 4.0)
		    this.currentTexture = 3;

	    if (this.timer >= 6.0)
	    {
		    this.alphaBlending -= 0.01;
		    if (this.alphaBlending <= 0.0)
		    {
			    this.alphaBlending = 0.0;
                return true;
		    }
	    }

        return false;
    },
}

// 45 bone id for right hand bottles tracking
//