const PBRStaticShader = {
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

            "uniform mat4 u_boneTransform; \n" +
            "uniform mat4 uShadowMatrix; \n" +

            "out vec4 out_ShadowPos; \n" +
            "out vec3 out_WorldPos; \n" +
            "out vec3 out_Normal; \n" +
            "out vec2 out_Texcoord; \n" +

            "void main (void) \n" +
            "{ \n" +

            "	vec4 tPosition = u_boneTransform * vPosition; \n " +
            "	vec3 tNormal   = (u_boneTransform * vec4(vNormal, 0.0)).xyz; \n " +

            "	out_Texcoord = vTexcoord; \n " +
            "	out_WorldPos = vec3(u_modelMatrix * tPosition); \n " +
            "	out_Normal = normalize(mat3(u_modelMatrix) * tNormal); \n " +

            "	out_ShadowPos = uShadowMatrix * vec4(out_WorldPos, 1.0); \n" +
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
            "precision highp int; \n" +

            "const float PI = 3.14159265359; \n" +

            "out vec4 FragColor; \n" +

            "in vec3 out_WorldPos; \n" +
            "in vec3 out_Normal; \n" +
            "in vec2 out_Texcoord; \n" +
            "in vec4 out_ShadowPos; \n" +

            "uniform sampler2D albedoMap; \n" +
            "uniform sampler2D normalMap; \n" +
            "uniform sampler2D metallicMap; \n" +
            "uniform sampler2D roughnessMap; \n" +
            "uniform sampler2D aoMap; \n" +
            "uniform highp sampler2DShadow uShadowMap; \n" +

            "uniform vec3 lightPosition[4]; \n" +
            "uniform vec3 lightColor[4]; \n" +

            "uniform vec3 cameraPos; \n" +

            "vec3 getNormalFromMap() \n" +
            "{ \n" +
            "	vec3 tangentNormal = texture(normalMap, out_Texcoord).xyz * 2.0 - 1.0; \n" +

            "	vec3 Q1 = dFdx(out_WorldPos); \n" +
            "	vec3 Q2 = dFdy(out_WorldPos); \n" +
            "	vec2 st1 = dFdx(out_Texcoord); \n" +
            "	vec2 st2 = dFdy(out_Texcoord); \n" +

            "	vec3 N = normalize(out_Normal); \n" +
            "	vec3 T = normalize(Q1*st2.t - Q2*st1.t); \n" +
            "	vec3 B = -normalize(cross(N, T)); \n" +
            "	mat3 TBN = mat3(T, B, N); \n" +

            "	return normalize(TBN * tangentNormal); \n" +
            "} \n" +

            "float DistributionGGX(vec3 N, vec3 H, float roughness) \n" +
            "{ \n" +
            "	float a = roughness * roughness; \n" +
            "	float a2 = a * a; \n" +
            "	float NdotH = max(dot(N, H), 0.0); \n" +
            "	float NdotH2 = NdotH * NdotH; \n" +

            "	float nom = a2; \n" +
            "	float denom = (NdotH2 * (a2 - 1.0) + 1.0); \n" +
            "	denom = PI * denom * denom; \n" +

            "	return nom / denom; \n" +
            "} \n" +

            "float GeometrySchlickGGX(float NdotV, float roughness) \n" +
            "{ \n" +
            "	float r = roughness + 1.0; \n" +
            "	float k = (r * r) / 8.0; \n" +

            "	float nom = NdotV; \n" +
            "	float denom = NdotV * (1.0 - k) + k; \n" +

            "	return nom / denom; \n" +
            "} \n" +

            "float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness) \n" +
            "{ \n" +
            "	float NdotV = max(dot(N, V), 0.0); \n" +
            "	float NdotL = max(dot(N, L), 0.0); \n" +

            "	float ggx2 = GeometrySchlickGGX(NdotV, roughness); \n" +
            "	float ggx1 = GeometrySchlickGGX(NdotL, roughness); \n" +

            "	return ggx1 * ggx2; \n" +
            "} \n" +

            "vec3 fresnelSchlick(float cosTheta, vec3 F0) \n" +
            "{ \n" +
            "	return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0); \n" +
            "} \n" +

            "void main (void) \n" +
            "{ \n" +
            "	vec3 albedo     = pow(texture(albedoMap, out_Texcoord).rgb, vec3(2.2)); \n" +
            "	float metallic  = texture(metallicMap, out_Texcoord).r; \n" +
            "	float roughness = texture(roughnessMap, out_Texcoord).r; \n" +
            "	float ao        = texture(aoMap, out_Texcoord).r; \n" +

            "   float shadow = textureProjOffset(uShadowMap, out_ShadowPos,ivec2(0,0));" +
            "   shadow += textureProjOffset(uShadowMap, out_ShadowPos,ivec2(0,1));" +
            "   shadow += textureProjOffset(uShadowMap, out_ShadowPos,ivec2(1,0));" +
            "   shadow += textureProjOffset(uShadowMap, out_ShadowPos,ivec2(0,-1));" +
            "   shadow += textureProjOffset(uShadowMap, out_ShadowPos,ivec2(-1,0));" +
            "   shadow *= 0.2;" +

            "	vec3 N = getNormalFromMap(); \n" +
            "	vec3 V = normalize(cameraPos - out_WorldPos); \n" +

            "	vec3 F0 = vec3(0.04); \n" +
            "	F0 = mix(F0, albedo, metallic); \n" +

            "	vec3 Lo = vec3(0.0); \n" +

            "	for(int i = 0; i < 1; i++) \n" +
            "	{ \n" +
            "		vec3 L = normalize(lightPosition[i] - out_WorldPos); \n" +
            "		vec3 H = normalize(V + L); \n" +
            "		float distance = length(lightPosition[i] - out_WorldPos); \n" +
            "		float attenuation = 0.5 / (distance * distance); \n" +
            "		vec3 radiance = lightColor[i]; \n" +

            "		float NDF = DistributionGGX(N, H, roughness); \n" +
            "		float G   = GeometrySmith(N, V, L, roughness); \n" +
            "		vec3 F    = fresnelSchlick(max(dot(H, V), 0.0), F0); \n" +

            "		vec3 nominator   = NDF * G * F; \n" +
            "		float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.001; \n" +
            "		vec3 specular = nominator / denominator; \n" +

            "		vec3 kS = F; \n" +
            "		vec3 kD = vec3(1.0) - kS; \n" +
            "		kD *= 1.0 - metallic; \n" +

            "		float NdotL = max(dot(N, L), 0.0); \n" +

            "		Lo += (kD * albedo / PI + specular) * radiance * NdotL; \n" +
            "	} \n" +

            "	vec3 ambient = vec3(0.2) * albedo * ao; \n" +

            "	vec3 color = ambient + (shadow*Lo); \n" +

            "	color = color / (color + vec3(1.0)); \n" +
            "	color = pow(color, vec3(1.0 / 2.2)); \n" +

            "	FragColor = vec4(vec3(color.r*0.21 + color.g*0.72 + color.b*0.07), 1.0); \n" +
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

        var albedoUniform = gl.getUniformLocation(this.program, "albedoMap");
        var normalUniform = gl.getUniformLocation(this.program, "normalMap");
        var metallicUniform = gl.getUniformLocation(this.program, "metallicMap");
        var roughnessUniform = gl.getUniformLocation(this.program, "roughnessMap");
        var aoUniform = gl.getUniformLocation(this.program, "aoMap");

        this.uniforms.lightPositionUniform = gl.getUniformLocation(this.program, "lightPosition");
        this.uniforms.lightColorUniform = gl.getUniformLocation(this.program, "lightColor");

        this.uniforms.uShadowMap = gl.getUniformLocation(this.program, "uShadowMap");
        this.uniforms.uShadowMatrix = gl.getUniformLocation(this.program, "uShadowMatrix");

        gl.useProgram(this.program);

        // set material related texture uniforms
        gl.uniform1i(albedoUniform, 0);
        gl.uniform1i(normalUniform, 1);
        gl.uniform1i(metallicUniform, 2);
        gl.uniform1i(roughnessUniform, 3);
        gl.uniform1i(aoUniform, 4);

        gl.useProgram(null);
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
