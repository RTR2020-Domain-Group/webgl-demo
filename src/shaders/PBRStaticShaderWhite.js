const PBRStaticShaderWhite = {
    program: 0,
    uniforms: {},

    init: function () {
        // vertex shader
        var vertexShaderSourceCode =
            "#version 300 es \n" +
            "precision highp int;" +

            "in vec4 vPosition; \n" +

            "uniform mat4 u_modelMatrix; \n" +
            "uniform mat4 u_viewMatrix; \n" +
            "uniform mat4 u_projectionMatrix; \n" +

            "uniform mat4 u_boneTransform; \n" +

            "void main (void) \n" +
            "{ \n" +
            "	vec4 tPosition = u_boneTransform * vPosition; \n " +
            "	vec3 out_WorldPos = vec3(u_modelMatrix * tPosition); \n " +
            "	gl_Position = u_projectionMatrix * u_viewMatrix * vec4(out_WorldPos, 1.0); \n" +
            "} \n";

        var vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShaderObject, vertexShaderSourceCode);
        gl.compileShader(vertexShaderObject);

        if (!gl.getShaderParameter(vertexShaderObject, gl.COMPILE_STATUS)) {
            var error = gl.getShaderInfoLog(vertexShaderObject);
            if (error.length > 0) {
                alert("PBR vertex " + error);
                return false;
            }
        }

        // fragment shader
        var fragmentShaderSourceCode =
            "#version 300 es \n" +
            "precision highp float; \n" +

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
                alert("PBR fragment" + error);
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

        // linking
        gl.linkProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            var error = gl.getProgramInfoLog(this.program);
            if (error.length > 0) {
                alert("PBR shader " + error);
                return false;
            }
        }

        // get unifrom locations
        this.uniforms.mUniform = gl.getUniformLocation(this.program, "u_modelMatrix");
        this.uniforms.vUniform = gl.getUniformLocation(this.program, "u_viewMatrix");
        this.uniforms.pUniform = gl.getUniformLocation(this.program, "u_projectionMatrix");
        this.uniforms.boneUniform = gl.getUniformLocation(this.program, "u_boneTransform");

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
