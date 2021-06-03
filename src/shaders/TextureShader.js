const TextureShader = {
    program: 0,
    uniforms: {},

    init: function () {
        // vertex shader
        var vertexShaderSourceCode =
            "#version 300 es \n" +
            "precision highp int;" +

            "in vec4 vPosition; \n" +
            "in vec2 vTexcoord; \n" +

            "out vec2 out_Texcoord; \n" +

            "void main (void) \n" +
            "{ \n" +
            "	out_Texcoord = vTexcoord; \n" +
            "	gl_Position = vec4(vPosition.xyz, 1.0); \n" +
            "} \n";

        var vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShaderObject, vertexShaderSourceCode);
        gl.compileShader(vertexShaderObject);

        if (!gl.getShaderParameter(vertexShaderObject, gl.COMPILE_STATUS)) {
            var error = gl.getShaderInfoLog(vertexShaderObject);
            if (error.length > 0) {
                alert("Texture vertex " + error);
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

            "uniform sampler2D uSampler; \n" +

            "void main (void) \n" +
            "{ \n" +
            "	FragColor = texture(uSampler, out_Texcoord); \n" +
            "} \n";

        var fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShaderObject, fragmentShaderSourceCode);
        gl.compileShader(fragmentShaderObject);

        if (!gl.getShaderParameter(fragmentShaderObject, gl.COMPILE_STATUS)) {
            var error = gl.getShaderInfoLog(fragmentShaderObject);
            if (error.length > 0) {
                alert("Texture fragment" + error);
                return false;
            }
        }

        // shader program 
        this.shaderProgramObject = gl.createProgram();
        gl.attachShader(this.shaderProgramObject, vertexShaderObject);
        gl.attachShader(this.shaderProgramObject, fragmentShaderObject);

        // pre-linking binding of shader program object with vertex shader attributes
        gl.bindAttribLocation(this.shaderProgramObject, WebGLMacros.AMC_ATTRIBUTE_VERTEX, "vPosition");
        gl.bindAttribLocation(this.shaderProgramObject, WebGLMacros.AMC_ATTRIBUTE_TEXCOORD0, "vTexcoord");

        // linking
        gl.linkProgram(this.shaderProgramObject);
        if (!gl.getProgramParameter(this.shaderProgramObject, gl.LINK_STATUS)) {
            var error = gl.getProgramInfoLog(this.shaderProgramObject);
            if (error.length > 0) {
                alert("Texture shader " + error);
                return false;
            }
        }

        // post-linking get uniform location
        this.uniforms.sampler = gl.getUniformLocation(this.shaderProgramObject, "uSampler");

        return true;
    },

    uninit: function () {
        gl.deleteProgram(this.shaderProgramObject);
    },

    use: function () {
        gl.useProgram(this.shaderProgramObject);
        return this.uniforms;
    }
};
