const TerrainShader = {
    program: 0,
    uniforms: {},

    init: function () {
        // vertex shader
        var vertexShaderSourceCode =
            "#version 300 es \n" +
            "precision highp float; \n" +
            "precision highp int; \n" +

            "in vec4 vPosition; \n" +
            "in vec2 vTexcoord; \n" +
            "out vec2 out_Texcoord; \n" +
            "out vec3 out_WorldPos; \n" +

            "uniform mat4 u_modelMatrix; \n" +
            "uniform mat4 u_viewMatrix; \n" +
            "uniform mat4 u_projectionMatrix; \n" +

            "uniform sampler2D uGrassBump; \n" +
            "uniform sampler2D uRoadBump; \n" +
            "uniform sampler2D uMask; \n" +
            "uniform float uTiling; \n" +

            "void main (void) \n" +
            "{ \n" +
            "	out_Texcoord = vTexcoord; \n" +
            "	vec4 pos = u_modelMatrix * vPosition; \n" +
            "	float mask = texture(uMask, out_Texcoord).r; \n" +
            "	float grass = texture(uGrassBump, out_Texcoord*uTiling*0.4).r; \n" +
            "	pos.y += mix(0.0, grass, mask); \n" +
            "	out_WorldPos = pos; \n " +
            "	pos = u_projectionMatrix * u_viewMatrix * pos; \n" +
            "	gl_Position = pos; \n" +
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

            "in vec3 out_WorldPos; \n" +
            "in vec2 out_Texcoord; \n" +
            "out vec4 FragColor; \n" +

            "uniform sampler2D uGrass; \n" +
            "uniform sampler2D uRoad; \n" +
            "uniform sampler2D uGrassNorm; \n" +
            "uniform sampler2D uRoadNorm; \n" +
            "uniform sampler2D uMask; \n" +
            "uniform float uTiling; \n" +

            "vec3 getNormalFromMap(sampler2D map, vec2 tc) \n" +
            "{ \n" +
            "	vec3 tangentNormal = texture(map, tc).xyz * 2.0 - 1.0; \n" +

            "	vec3 Q1 = dFdx(out_WorldPos); \n" +
            "	vec3 Q2 = dFdy(out_WorldPos); \n" +
            "	vec2 st1 = dFdx(tc); \n" +
            "	vec2 st2 = dFdy(tc); \n" +

            "	vec3 N = normalize(vec3(0.0, 1.0, 0.0)); \n" +
            "	vec3 T = normalize(Q1*st2.t - Q2*st1.t); \n" +
            "	vec3 B = -normalize(cross(N, T)); \n" +
            "	mat3 TBN = mat3(T, B, N); \n" +

            "	return normalize(TBN * tangentNormal); \n" +
            "} \n" +

            "void main (void) \n" +
            "{ \n" +
            "	float mask = texture(uMask, out_Texcoord).r; \n" +
            "	vec4 grass = texture(uGrass, out_Texcoord*uTiling*0.4); \n" +
            "	vec4 road = texture(uRoad, out_Texcoord*uTiling); \n" +
            "	FragColor = mix(road, grass, mask); \n" +
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
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShaderObject);
        gl.attachShader(this.program, fragmentShaderObject);

        // pre-linking binding of shader program object with vertex shader attributes
        gl.bindAttribLocation(this.program, WebGLMacros.AMC_ATTRIBUTE_VERTEX, "vPosition");
        gl.bindAttribLocation(this.program, WebGLMacros.AMC_ATTRIBUTE_TEXCOORD0, "vTexcoord");

        // linking
        gl.linkProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            var error = gl.getProgramInfoLog(this.program);
            if (error.length > 0) {
                alert("Texture shader " + error);
                return false;
            }
        }

        // post-linking get uniform location
        this.uniforms.mUniform = gl.getUniformLocation(this.program, "u_modelMatrix");
        this.uniforms.vUniform = gl.getUniformLocation(this.program, "u_viewMatrix");
        this.uniforms.pUniform = gl.getUniformLocation(this.program, "u_projectionMatrix");

        this.uniforms.uGrassBump = gl.getUniformLocation(this.program, "uGrassBump");
        this.uniforms.uRoadBump = gl.getUniformLocation(this.program, "uRoadBump");
        this.uniforms.uGrass = gl.getUniformLocation(this.program, "uGrass");
        this.uniforms.uRoad = gl.getUniformLocation(this.program, "uRoad");
        this.uniforms.uMask = gl.getUniformLocation(this.program, "uMask");
        this.uniforms.uTiling = gl.getUniformLocation(this.program, "uTiling");


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
