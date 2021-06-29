const TwoSidedTextureShader = {
    program: 0,
    uniforms: {},

    init: function () {
        // vertex shader
        var vertexShaderSourceCode =
            "#version 300 es \n" +
            "precision highp int;" +

            "in vec4 vPosition; \n" +
            "in vec3 vNormal; \n" +
            "in vec2 vTexcoord; \n" +

            "uniform mat4 u_modelMatrix; \n" +
            "uniform mat4 u_viewMatrix; \n" +
            "uniform mat4 u_projectionMatrix; \n" +

            "out vec2 out_Texcoord; \n" +

            "void main (void) \n" +
            "{ \n" +
            "	out_Texcoord = vTexcoord; \n" +
            "	gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vPosition; \n" +
            "} \n";

        var vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShaderObject, vertexShaderSourceCode);
        gl.compileShader(vertexShaderObject);

        if (!gl.getShaderParameter(vertexShaderObject, gl.COMPILE_STATUS)) {
            var error = gl.getShaderInfoLog(vertexShaderObject);
            if (error.length > 0) {
                alert("Two Sided Texture vertex " + error);
                return false;
            }
        }

        // fragment shader
        var fragmentShaderSourceCode =
            "#version 300 es \n" +
            "precision highp float; \n" +
            "precision highp int; \n" +

            "in vec2 out_Texcoord; \n" +
            "out vec4 FragColor; \n" +

            "uniform sampler2D uFrontTex; \n" +
            "uniform sampler2D uBackTex; \n" +

            "void main (void) \n" +
            "{ \n" +
            "   if (gl_FrontFacing) \n" +
            "	    FragColor = texture(uFrontTex, out_Texcoord); \n" +
            "   else \n" +
            "	    FragColor = texture(uBackTex, out_Texcoord); \n" +
            "} \n";

        var fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShaderObject, fragmentShaderSourceCode);
        gl.compileShader(fragmentShaderObject);

        if (!gl.getShaderParameter(fragmentShaderObject, gl.COMPILE_STATUS)) {
            var error = gl.getShaderInfoLog(fragmentShaderObject);
            if (error.length > 0) {
                alert("Two Sided Texture fragment" + error);
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
                alert("Two Sided Texture shader " + error);
                return false;
            }
        }

        // post-linking get uniform location
        var uFrontTex = gl.getUniformLocation(this.program, "uFrontTex");
        var uBackTex = gl.getUniformLocation(this.program, "uBackTex");
        this.uniforms.mUniform = gl.getUniformLocation(this.program, "u_modelMatrix");
        this.uniforms.vUniform = gl.getUniformLocation(this.program, "u_viewMatrix");
        this.uniforms.pUniform = gl.getUniformLocation(this.program, "u_projectionMatrix");

        gl.useProgram(this.program);

        // set material related texture uniforms
        gl.uniform1i(uFrontTex, 0);
        gl.uniform1i(uBackTex, 1);

        gl.useProgram(null);

        return true;
    },

    uninit: function () {
        gl.deleteProgram(this.program);
    },

    use: function () {
        gl.useProgram(this.program);
        return this.uniforms;
    }
};
