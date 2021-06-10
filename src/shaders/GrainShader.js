const GrainShader = {
    program: 0,
    uniforms: {},

    init: function () {
        // vertex shader
        var vertexShaderSourceCode =
            "#version 300 es \n" +
            "precision highp int;" +

            "out vec2 out_Texcoord; \n" +

            "const vec2 pos[] = vec2[]( \n" +
            "    vec2(-1.0, -1.0), \n" +
            "    vec2(1.0, -1.0), \n" +
            "    vec2(1.0, 1.0), \n" +
            "    vec2(-1.0, 1.0)); \n" +

            "const vec2 tex[] = vec2[]( \n" +
            "    vec2(0.0, 0.0), \n" +
            "    vec2(1.0, 0.0), \n" +
            "    vec2(1.0, 1.0), \n" +
            "    vec2(0.0, 1.0)); \n" +

            "void main (void) \n" +
            "{ \n" +
            "	out_Texcoord = tex[gl_VertexID]; \n" +
            "	gl_Position = vec4(pos[gl_VertexID], 0.0, 1.0); \n" +
            "} \n";

        var vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShaderObject, vertexShaderSourceCode);
        gl.compileShader(vertexShaderObject);

        if (!gl.getShaderParameter(vertexShaderObject, gl.COMPILE_STATUS)) {
            var error = gl.getShaderInfoLog(vertexShaderObject);
            if (error.length > 0) {
                alert("Grain vertex " + error);
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
            "uniform sampler2D noise; \n" +
            "uniform vec2 delta; \n" +

            "void main (void) \n" +
            "{ \n" +
            "	vec3 color = texture(uSampler, out_Texcoord).rgb; \n" +
            "	float tr = min(color.r*0.333 + color.g*0.333 + color.b*0.333, 1.0); \n" +
            "	float tg = min(color.r*0.333 + color.g*0.333 + color.b*0.333, 1.0); \n" +
            "	float tb = min(color.r*0.303 + color.g*0.303 + color.b*0.303, 1.0); \n" +
            "	FragColor =  vec4(tr, tg, tb, 1.0) * texture(noise, out_Texcoord+delta); \n" +
            "} \n";

        var fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShaderObject, fragmentShaderSourceCode);
        gl.compileShader(fragmentShaderObject);

        if (!gl.getShaderParameter(fragmentShaderObject, gl.COMPILE_STATUS)) {
            var error = gl.getShaderInfoLog(fragmentShaderObject);
            if (error.length > 0) {
                alert("Grain fragment" + error);
                return false;
            }
        }

        // shader program 
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShaderObject);
        gl.attachShader(this.program, fragmentShaderObject);

        // linking
        gl.linkProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            var error = gl.getProgramInfoLog(this.program);
            if (error.length > 0) {
                alert("Grain shader " + error);
                return false;
            }
        }

        // post-linking get uniform location
        this.uniforms.sampler = gl.getUniformLocation(this.program, "uSampler");
        this.uniforms.noise = gl.getUniformLocation(this.program, "noise");
        this.uniforms.delta = gl.getUniformLocation(this.program, "delta");

        gl.useProgram(this.program);
        gl.uniform1i(this.uniforms.sampler, 0);
        gl.uniform1i(this.uniforms.noise, 1);
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
