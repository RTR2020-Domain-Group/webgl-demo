const TreeShader = {
    program: 0,
    uniforms: {},

    init: function () {
        // vertex shader
        var vertexShaderSourceCode =
            "#version 300 es\n"+
            "uniform float t;\n"+
            "in vec3 pos;\n"+
            "in vec2 uv;\n"+           
            "uniform mat4 u_model_matrix;\n"+
            "uniform mat4 u_view_matrix;\n"+
            "uniform mat4 u_projection_matrix;\n"+
            "out highp vec3 vpos;\n"+    
            "out highp vec2 vuv;\n"+   
            "void main(void)\n"+
            "{\n"+    
            "   vpos = pos;\n"+
            "   vuv = uv;\n"+
            "   vec3 p = pos - vec3(0, 0.60, 0);\n"+    
            "   float t1 = t / 10000.0;\n"+            
            "   p.z = 0.5 * p.z;\n"+
            "   gl_Position = u_projection_matrix * u_view_matrix * u_model_matrix * vec4(p.x, p.y, p.z, 1.0);\n"+
            "}\n";

        var vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShaderObject, vertexShaderSourceCode);
        gl.compileShader(vertexShaderObject);

        if (!gl.getShaderParameter(vertexShaderObject, gl.COMPILE_STATUS)) {
            var error = gl.getShaderInfoLog(vertexShaderObject);
            if (error.length > 0) {
                alert("Tree vertex " + error);
                return false;
            }
        }

        // fragment shader
        var fragmentShaderSourceCode =
            "#version 300 es \n" +
            "precision highp float;\n"+
            "in highp vec3 vpos;\n"+
            "in highp vec2 vuv;\n"+
            "out vec4 FragColor;\n"+
            "void main() {\n"+
            "   float v = vuv.x / 10.0;\n"+
            "   float h = vuv.y / 2.0 + 0.5;\n"+
            "   float b = 1.0 - v * 0.7;\n"+
            "   FragColor = vec4(vec3(h * v, h * b, b * 0.6), 1);\n"+
            "}\n";

        var fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShaderObject, fragmentShaderSourceCode);
        gl.compileShader(fragmentShaderObject);

        if (!gl.getShaderParameter(fragmentShaderObject, gl.COMPILE_STATUS)) {
            var error = gl.getShaderInfoLog(fragmentShaderObject);
            if (error.length > 0) {
                alert("Tree fragment" + error);
                return false;
            }
        }

        // shader program 
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShaderObject);
        gl.attachShader(this.program, fragmentShaderObject);

        // pre-linking binding of shader program object with vertex shader attributes
        gl.bindAttribLocation(this.program, WebGLMacros.AMC_ATTRIBUTE_VERTEX, "pos");
        gl.bindAttribLocation(this.program, WebGLMacros.AMC_ATTRIBUTE_COLOR, "uv");

        // linking
        gl.linkProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            var error = gl.getProgramInfoLog(this.program);
            if (error.length > 0) {
                alert("Tree shader Program " + error);
                return false;
            }
        }

        // post-linking get uniform location
        this.uniforms.t = gl.getUniformLocation(this.program, "t");
        this.uniforms.vUniform = gl.getUniformLocation(this.program, "u_view_matrix");
        this.uniforms.mUniform = gl.getUniformLocation(this.program, "u_model_matrix");
        this.uniforms.pUniform = gl.getUniformLocation(this.program, "u_projection_matrix");
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
