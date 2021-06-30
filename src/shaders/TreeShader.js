const TreeShader = {
    program: 0,
    uniforms: {

    },

    init: function () {
        // vertex shader
        var vertexShaderSourceCode =
            "#version 300 es\n" +
            "uniform float t;\n" +
            "in vec3 vPosition;\n" +
            "in vec3 vNormal; \n" +
            "in vec2 uv;\n" +
            "in vec2 vTex;\n" +
            "uniform mat4 u_model_matrix;\n" +
            "uniform mat4 u_view_matrix;\n" +
            "uniform mat4 u_projection_matrix;\n" +
            "uniform vec3 u_lD; \n" +
            "uniform vec3 u_kD; \n" +
            "uniform vec4 u_light_position; \n" +
            "out vec3 transformed_normal; \n" +
            "out vec3 light_direction; \n" +
            "out vec3 view_vector; \n" +
            "out highp vec3 vpos;\n" +
            "out highp vec2 vuv;\n" +
            "out highp vec2 out_Tex;\n" +
            "void main(void)\n" +
            "{\n" +
            "   vpos = vPosition;\n" +
            "   vuv = uv;\n" +
            "   vec3 p = vPosition - vec3(0, 0.60, 0);\n" +
            "   p.z = 0.7 * p.z;\n" +
            "	vec4 eye_coordinates = u_view_matrix * u_model_matrix * vec4(p, 1.0); \n" +
            "	transformed_normal = mat3(u_model_matrix) * vNormal; \n" +
            "	light_direction = vec3(u_light_position - (u_model_matrix * vec4(p, 1.0))); \n" +
            "	view_vector = -eye_coordinates.xyz; \n" +
            "   gl_Position = u_projection_matrix * eye_coordinates;\n" +
            "   out_Tex = vTex;\n" +
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
            "precision highp float;\n" +
            "in highp vec3 vpos;\n" +
            "in highp vec2 vuv;\n" +
            "in highp vec2 out_Tex;\n" +
            "in vec3 transformed_normal;\n" +
            "in vec3 light_direction;\n" +
            "in vec3 view_vector;\n" +
            "uniform vec3 u_la;\n" +
            "uniform vec3 u_ld;\n" +
            "uniform vec3 u_ls;\n" +
            "uniform vec3 u_ka;\n" +
            "uniform vec3 u_kd;\n" +
            "uniform vec3 u_ks;\n" +
            "uniform float u_material_shininess;\n" +
            "uniform sampler2D uTex;\n" +
            "out vec4 FragColor;\n" +
            "void main() {\n" +
            "   vec3 fong_ads_light;\n" +
            "   float v = vuv.x / 10.0;\n" +
            "   float h = vuv.y / 2.0 + 0.5;\n" +
            "   float b = 1.0 - v * 0.7;\n" +
            "   vec3 n_t_normal = normalize(transformed_normal);\n" +
            "   vec3 n_light_direction = normalize(light_direction);\n" +
            "   vec3 n_view_vector = normalize(view_vector);\n" +
            "   vec3 reflection_vector = reflect(-n_light_direction, n_t_normal);\n" +
            "   vec3 ambient = vec3(0.25);\n" +
            "   vec3 diffuse = vec3(h * v, h * b, b * 0.6) * max(dot(n_t_normal, n_light_direction), 0.0);\n" +
            "   fong_ads_light = ambient + diffuse;\n" +
            "   FragColor = vec4(fong_ads_light, 1);\n" +
            "   FragColor *= texture(uTex, out_Tex); \n" +
            "   FragColor = vec4(vec3(FragColor.r*0.21 + FragColor.g*0.72 + FragColor.b*0.07), 1.0); \n" +
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
        gl.bindAttribLocation(this.program, WebGLMacros.AMC_ATTRIBUTE_NORMAL, "vNormal");
        gl.bindAttribLocation(this.program, WebGLMacros.AMC_ATTRIBUTE_TEXCOORD0, "vTex");

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

        this.uniforms.uTex = gl.getUniformLocation(this.program, "uTex");
        this.uniforms.gLAUniform = gl.getUniformLocation(this.program, "u_la");
        this.uniforms.gLDUniform = gl.getUniformLocation(this.program, "u_ld");
        this.uniforms.gLSUniform = gl.getUniformLocation(this.program, "u_ls");
        this.uniforms.gLightPositionUniform = gl.getUniformLocation(this.program, "u_light_position");

        this.uniforms.gKAUniform = gl.getUniformLocation(this.program, "u_ka");
        this.uniforms.gKDUniform = gl.getUniformLocation(this.program, "u_kd");
        this.uniforms.gKSUniform = gl.getUniformLocation(this.program, "u_ks");
        this.uniforms.gMaterialShininessUniform = gl.getUniformLocation(this.program, "u_material_shininess");

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
