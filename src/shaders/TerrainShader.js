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

            "out vec3 light_direction;" +
            "out vec3 viewer_vector;" +
            "out vec3 tnorm;" +

            "uniform mat4 u_modelMatrix; \n" +
            "uniform mat4 u_viewMatrix; \n" +
            "uniform mat4 u_projectionMatrix; \n" +

            "uniform vec4 light_position; \n" +

            "uniform sampler2D uGrassBump; \n" +
            "uniform sampler2D uRoadBump; \n" +
            "uniform sampler2D uMask; \n" +
            "uniform float uTiling; \n" +

            "void main (void) \n" +
            "{ \n" +
            "	out_Texcoord = vTexcoord; \n" +
            "	vec4 pos = u_modelMatrix * vPosition; \n" +
            "	float mask = texture(uMask, out_Texcoord).r; \n" +
            "	float grass = 25.0*texture(uGrassBump, out_Texcoord*uTiling*0.4).r; \n" +
            "	float road = 5.0*texture(uRoadBump, out_Texcoord*uTiling).r; \n" +
            "	pos.y += max(0.1, mix(road, grass, mask)); \n" +
            "	out_WorldPos = pos.xyz; \n " +

            "	pos = u_viewMatrix * pos; \n" +
            "   tnorm = mat3(u_modelMatrix) * vec3(0.0, 1.0, 0.0);" +
            "   viewer_vector = vec3(-pos.xyz);" +
            "   light_direction = vec3(light_position - pos);" +

            "	pos = u_projectionMatrix * pos; \n" +
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

            "in vec3 light_direction;" +
            "in vec3 viewer_vector;" +
            "in vec3 tnorm;" +

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

            "	vec3 N = normalize(tnorm); \n" +
            "	vec3 T = normalize(Q1*st2.t - Q2*st1.t); \n" +
            "	vec3 B = -normalize(cross(N, T)); \n" +
            "	mat3 TBN = mat3(T, B, N); \n" +

            "	return normalize(TBN * tangentNormal); \n" +
            "} \n" +

            "vec4 light(vec3 normal) \n" +
            "{ \n" +
            "	vec3 nviewer_vector = normalize(viewer_vector); \n" +

            "   vec3 nlight_direction = normalize(light_direction);" +
            "   vec3 reflection_vector_white = reflect(-nlight_direction, normal);" +
            "   float tn_dot_ldir_white = max(dot(normal, nlight_direction), 0.0);" +
            "   vec3 diffuse_white  = vec3(1.0)*tn_dot_ldir_white;" +
            "   vec3 specular_white = vec3(1.0)*pow(max(dot(reflection_vector_white, nviewer_vector), 0.0), 128.0);" +

            "   vec3 phong_ads_light = diffuse_white + specular_white;" +
            "   return vec4(phong_ads_light, 1.0);" +
            "} \n" +

            "void main (void) \n" +
            "{ \n" +
            "   vec3 norm1, norm2; \n" +
            "	float mask = texture(uMask, out_Texcoord).r; \n" +
            "	vec4 grass = texture(uGrass, out_Texcoord*uTiling*0.4); \n" +
            "	vec4 road = texture(uRoad, out_Texcoord*uTiling); \n" +

            "	vec4 grassNorm = texture(uGrassNorm, out_Texcoord*uTiling*0.4); \n" +
            "	vec4 roadNorm = texture(uRoadNorm, out_Texcoord*uTiling); \n" +

            "   norm1 = getNormalFromMap(uRoadNorm, out_Texcoord*uTiling); \n" +
            "   norm2 = getNormalFromMap(uGrassNorm, out_Texcoord*uTiling*0.4); \n" +

            "	FragColor = mix(road, grass, mask) * light(mix(norm1, norm2, mask)); \n" +
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
        this.uniforms.uGrassNorm = gl.getUniformLocation(this.program, "uGrassNorm");
        this.uniforms.uRoadNorm = gl.getUniformLocation(this.program, "uRoadNorm");
        this.uniforms.uGrass = gl.getUniformLocation(this.program, "uGrass");
        this.uniforms.uRoad = gl.getUniformLocation(this.program, "uRoad");
        this.uniforms.uMask = gl.getUniformLocation(this.program, "uMask");
        this.uniforms.uTiling = gl.getUniformLocation(this.program, "uTiling");
        this.uniforms.light_position = gl.getUniformLocation(this.program, "light_position");


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
