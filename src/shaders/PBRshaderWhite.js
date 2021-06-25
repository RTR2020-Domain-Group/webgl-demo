const PBRshaderWhite = {
    program: 0,
    uniforms: {},

    init: function () {
        // vertex shader
        var vertexShaderSourceCode =
            "#version 300 es \n" +
            "precision highp int;" +
            "precision highp float;" +

            "in vec4 vPosition; \n" +
            "in vec3 vNormal; \n" +
            "in vec2 vTexcoord; \n" +
            "in vec4 vBoneIDs; \n" +
            "in vec4 vBoneWeights; \n" +

            "uniform mat4 u_modelMatrix; \n" +
            "uniform mat4 u_viewMatrix; \n" +
            "uniform mat4 u_projectionMatrix; \n" +
            "uniform mat4 u_boneMatrix[100]; \n" +

            "void main (void) \n" +
            "{ \n" +
            "	mat4 boneTransform; \n" +
            "	boneTransform  = vBoneWeights.x * u_boneMatrix[int(round(vBoneIDs.x))]; \n" +
            "	boneTransform += vBoneWeights.y * u_boneMatrix[int(round(vBoneIDs.y))]; \n" +
            "	boneTransform += vBoneWeights.z * u_boneMatrix[int(round(vBoneIDs.z))]; \n" +
            "	boneTransform += vBoneWeights.w * u_boneMatrix[int(round(vBoneIDs.w))]; \n" +

            "	vec4 tPosition = boneTransform * vPosition; \n " +
            "	vec3 out_WorldPos = vec3(u_modelMatrix * tPosition); \n " +
            "	gl_Position = u_projectionMatrix * u_viewMatrix * vec4(out_WorldPos, 1.0); \n" +
            "} \n";

        var vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShaderObject, vertexShaderSourceCode);
        gl.compileShader(vertexShaderObject);

        if (!gl.getShaderParameter(vertexShaderObject, gl.COMPILE_STATUS)) {
            var error = gl.getShaderInfoLog(vertexShaderObject);
            if (error.length > 0) {
                alert("PBR white vertex " + error);
                return false;
            }
        }

        // fragment shader
        var fragmentShaderSourceCode =
            "#version 300 es \n" +
            "precision highp int;" +
            "precision highp float;" +

            "out vec4 FragColor; \n" +
          
            "void main (void) \n" +
            "{ \n" +
            "	FragColor = vec4(1.0); \n" +
            "} \n";

        var fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShaderObject, fragmentShaderSourceCode);
        gl.compileShader(fragmentShaderObject);

        if (!gl.getShaderParameter(fragmentShaderObject, gl.COMPILE_STATUS)) {
            var error = gl.getShaderInfoLog(fragmentShaderObject);
            if (error.length > 0) {
                alert("PBR white fragment" + error);
                return false;
            }
        }

        // shader program 
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShaderObject);
        gl.attachShader(this.program, fragmentShaderObject);

        // pre-linking binding of shader program object with vertex shader attributes
        gl.bindAttribLocation(this.program, WebGLMacros.AMC_ATTRIBUTE_VERTEX, "vPosition");
        gl.bindAttribLocation(this.program, WebGLMacros.AMC_ATTRIBUTE_NORMAL, "vNormal");
        gl.bindAttribLocation(this.program, WebGLMacros.AMC_ATTRIBUTE_TEXCOORD0, "vTexcoord");
        gl.bindAttribLocation(this.program, WebGLMacros.AMC_ATTRIBUTE_BONEIDS, "vBoneIDs");
        gl.bindAttribLocation(this.program, WebGLMacros.AMC_ATTRIBUTE_BONEWEIGHTS, "vBoneWeights");

        // linking
        gl.linkProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            var error = gl.getProgramInfoLog(this.program);
            if (error.length > 0) {
                alert("PBR shader white " + error);
                return false;
            }
        }

        // get unifrom locations
        this.uniforms.mUniform = gl.getUniformLocation(this.program, "u_modelMatrix");
        this.uniforms.vUniform = gl.getUniformLocation(this.program, "u_viewMatrix");
        this.uniforms.pUniform = gl.getUniformLocation(this.program, "u_projectionMatrix");

        this.uniforms.boneMatrixUniform = gl.getUniformLocation(this.program, "u_boneMatrix");
        return true;
    },

    uninit: function () {
        var shaders = gl.getAttachedShaders(this.program);
        for (var i = 0; i < shaders.length; i += 1) {
            gl.deleteShader(shaders[i]);
        }
        gl.deleteProgram(this.program);
    },

    use: function () {
        gl.useProgram(this.program);
        return this.uniforms;
    }
};
