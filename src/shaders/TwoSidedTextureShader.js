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
            "uniform vec4 light_position; \n" +

            "out vec2 out_Texcoord; \n" +
            "out vec3 light_direction;" +
            "out vec3 viewer_vector;" +
            "out vec3 tnorm;" +

            "void main (void) \n" +
            "{ \n" +

            "	vec4 pos = u_modelMatrix * vPosition; \n" +
            "	pos = u_viewMatrix * pos; \n" +
            "   tnorm = mat3(u_modelMatrix) * vNormal;" +
            "   viewer_vector = vec3(-pos.xyz);" +
            "   light_direction = vec3(light_position - pos);" +

            "	out_Texcoord = vTexcoord; \n" +
            "	gl_Position = u_projectionMatrix * pos; \n" +
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
            "in vec3 light_direction;" +
            "in vec3 viewer_vector;" +
            "in vec3 tnorm;" +

            "out vec4 FragColor; \n" +

            "uniform sampler2D uFrontTex; \n" +
            "uniform sampler2D uBackTex; \n" +

            "vec4 light(vec3 normal, float shadow) \n" +
            "{ \n" +
            "	vec3 nviewer_vector = normalize(viewer_vector); \n" +

            "   vec3 nlight_direction = normalize(light_direction);" +
            "   vec3 reflection_vector_white = reflect(-nlight_direction, normal);" +
            "   float tn_dot_ldir_white = max(dot(normal, nlight_direction), 0.0);" +
            "   vec3 ambient_white  = vec3(0.2);" +
            "   vec3 diffuse_white  = vec3(1.0)*tn_dot_ldir_white;" +
            "   vec3 specular_white = vec3(1.0)*pow(max(dot(reflection_vector_white, nviewer_vector), 0.0), 128.0);" +

            "   vec3 phong_ads_light = ambient_white + (shadow*(diffuse_white + specular_white));" +
            "   return vec4(phong_ads_light, 1.0);" +
            "} \n" +

            "void main (void) \n" +
            "{ \n" +
            "   if (gl_FrontFacing) \n" +
            "	    FragColor = texture(uFrontTex, out_Texcoord); \n" +
            "   else \n" +
            "	    FragColor = texture(uBackTex, out_Texcoord); \n" +

            "   FragColor *= light(tnorm, 1.0); \n" +
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
        this.uniforms.light_position = gl.getUniformLocation(this.program, "light_position");


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
