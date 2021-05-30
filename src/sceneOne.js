var sceneOne = {

    vertexShaderObject: 0,
    fragmentShaderObject: 0,
    shaderProgramObject: 0,

    vaoCube: 0,
    vboCube: 0,
    vboElement: 0,

    mUniform: 0,
    vUniform: 0,
    pUniform: 0,
    albedoUniform: 0,
    normalUniform: 0,
    metallicUniform: 0,
    roughnessUniform: 0,
    aoUniform: 0,
    boneMatrixUniform: 0,
    lightPositionUniform: 0,

    albedoMap: 0,
    normalMap: 0,
    metallicMap: 0,
    roughnessMap: 0,
    aoMap: 0,

    lightAmbient: new Float32Array([0.5, 0.5, 0.5]),
    lightDiffuse: new Float32Array([1.0, 1.0, 1.0]),
    lightSpecular: new Float32Array([1.0, 1.0, 1.0]),
    lightPosition: new Float32Array([10.0, 10.0, 10.0, 1.0]),
    perspectiveProjectionMatrix: mat4.create(),

    bLight: false,
    t: 0,
    numElements: 0,

    init: function () {
        // vertex shader
        var vertexShaderSourceCode =
            "#version 300 es \n" +
            "precision highp int;" +

            "in vec4 vPosition; \n" +
            "in vec3 vNormal; \n" +
            "in vec2 vTexcoord; \n" +
            "in vec4 vBoneIDs; \n" +
            "in vec4 vBoneWeights; \n" +

            "uniform mat4 u_modelMatrix; \n" +
            "uniform mat4 u_viewMatrix; \n" +
            "uniform mat4 u_projectionMatrix; \n" +
            "uniform mat4 u_boneMatrix[100]; \n" +

            "out vec3 out_WorldPos; \n" +
            "out vec3 out_Normal; \n" +
            "out vec2 out_Texcoord; \n" +

            "void main (void) \n" +
            "{ \n" +
            "	mat4 boneTransform; \n" +
            "	boneTransform  = vBoneWeights.x * u_boneMatrix[int(round(vBoneIDs.x))]; \n" +
            "	boneTransform += vBoneWeights.y * u_boneMatrix[int(round(vBoneIDs.y))]; \n" +
            "	boneTransform += vBoneWeights.z * u_boneMatrix[int(round(vBoneIDs.z))]; \n" +
            "	boneTransform += vBoneWeights.w * u_boneMatrix[int(round(vBoneIDs.w))]; \n" +

            "	vec4 tPosition = boneTransform * vPosition; \n " +
            "	vec3 tNormal   = (boneTransform * vec4(vNormal, 0.0)).xyz; \n " +

            "	out_Texcoord = vTexcoord; \n " +
            "	out_WorldPos = vec3(u_modelMatrix * tPosition); \n " +
            "	out_Normal = normalize(mat3(u_modelMatrix) * tNormal); \n " +

            "	gl_Position = u_projectionMatrix * u_viewMatrix * vec4(out_WorldPos, 1.0); \n" +
            "} \n";

        this.vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(this.vertexShaderObject, vertexShaderSourceCode);
        gl.compileShader(this.vertexShaderObject);

        if (!gl.getShaderParameter(this.vertexShaderObject, gl.COMPILE_STATUS)) {
            var error = gl.getShaderInfoLog(this.vertexShaderObject);
            if (error.length > 0) {
                alert("vertex " + error);
                uninitialize();
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

            "uniform sampler2D albedoMap; \n" +
            "uniform sampler2D normalMap; \n" +
            "uniform sampler2D metallicMap; \n" +
            "uniform sampler2D roughnessMap; \n" +
            "uniform sampler2D aoMap; \n" +

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
            "		float attenuation = 1.0 / (distance * distance); \n" +
            "		vec3 radiance = lightColor[i] * attenuation; \n" +

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

            "	vec3 ambient = vec3(0.1) * albedo * ao; \n" +

            "	vec3 color = ambient + Lo; \n" +

            "	color = color / (color + vec3(1.0)); \n" +
            "	color = pow(color, vec3(1.0 / 2.2)); \n" +

            "	FragColor = vec4(color, 1.0); \n" +
            "} \n";

        this.fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(this.fragmentShaderObject, fragmentShaderSourceCode);
        gl.compileShader(this.fragmentShaderObject);

        if (!gl.getShaderParameter(this.fragmentShaderObject, gl.COMPILE_STATUS)) {
            var error = gl.getShaderInfoLog(this.fragmentShaderObject);
            if (error.length > 0) {
                alert("fragment" + error);
                uninitialize();
            }
        }

        // shader program 
        this.shaderProgramObject = gl.createProgram();
        gl.attachShader(this.shaderProgramObject, this.vertexShaderObject);
        gl.attachShader(this.shaderProgramObject, this.fragmentShaderObject);

        // pre-linking binding of shader program object with vertex shader attributes
        gl.bindAttribLocation(this.shaderProgramObject, WebGLMacros.AMC_ATTRIBUTE_VERTEX, "vPosition");
        gl.bindAttribLocation(this.shaderProgramObject, WebGLMacros.AMC_ATTRIBUTE_NORMAL, "vNormal");
        gl.bindAttribLocation(this.shaderProgramObject, WebGLMacros.AMC_ATTRIBUTE_TEXCOORD0, "vTexcoord");
        gl.bindAttribLocation(this.shaderProgramObject, WebGLMacros.AMC_ATTRIBUTE_BONEIDS, "vBoneIDs");
        gl.bindAttribLocation(this.shaderProgramObject, WebGLMacros.AMC_ATTRIBUTE_BONEWEIGHTS, "vBoneWeights");

        // linking
        gl.linkProgram(this.shaderProgramObject);
        if (!gl.getProgramParameter(this.shaderProgramObject, gl.LINK_STATUS)) {
            var error = gl.getProgramInfoLog(this.shaderProgramObject);
            if (error.length > 0) {
                alert(error);
                uninitialize();
            }
        }

        // get unifrom locations
        this.mUniform = gl.getUniformLocation(this.shaderProgramObject, "u_modelMatrix");
        this.vUniform = gl.getUniformLocation(this.shaderProgramObject, "u_viewMatrix");
        this.pUniform = gl.getUniformLocation(this.shaderProgramObject, "u_projectionMatrix");

        this.boneMatrixUniform = gl.getUniformLocation(this.shaderProgramObject, "u_boneMatrix");

        this.albedoUniform = gl.getUniformLocation(this.shaderProgramObject, "albedoMap");
        this.normalUniform = gl.getUniformLocation(this.shaderProgramObject, "normalMap");
        this.metallicUniform = gl.getUniformLocation(this.shaderProgramObject, "metallicMap");
        this.roughnessUniform = gl.getUniformLocation(this.shaderProgramObject, "roughnessMap");
        this.aoUniform = gl.getUniformLocation(this.shaderProgramObject, "aoMap");

        this.shininessUniform = gl.getUniformLocation(this.shaderProgramObject, "u_shininess");
        this.lightPositionUniform = gl.getUniformLocation(this.shaderProgramObject, "lightPosition");
        this.lightColorUniform = gl.getUniformLocation(this.shaderProgramObject, "lightColor");

        gl.useProgram(this.shaderProgramObject);

        // set texture uniforms
        gl.uniform1i(this.albedoUniform, 0);
        gl.uniform1i(this.normalUniform, 1);
        gl.uniform1i(this.metallicUniform, 2);
        gl.uniform1i(this.roughnessUniform, 3);
        gl.uniform1i(this.aoUniform, 4);

        // set light
        gl.uniform3fv(this.lightPositionUniform, [7.0 * Math.cos(3.7), 0.0, 7.0 * Math.sin(3.7)]);
        gl.uniform3fv(this.lightColorUniform, [150.0, 150.0, 150.0]);

        gl.useProgram(null);

        // pyramid Position
        var cubeVertices = new Float32Array(jwModel.vertex);
        var cubeIndices = new Uint32Array(jwModel.index);
        this.numElements = jwModel.index.length;

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);

        gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_VERTEX,
            3, // 3 for x,y,z axes in vertex array
            gl.FLOAT,
            false, // is normalized?
            16 * 4, 0 * 4); // stride and offset
        gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_VERTEX);

        gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_NORMAL,
            3, // 3 for x,y,z axes in vertex array
            gl.FLOAT,
            false, // is normalized?
            16 * 4, 3 * 4); // stride and offset
        gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_NORMAL);

        gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_TEXCOORD0,
            2, // 2 for s,t axes in vertex array
            gl.FLOAT,
            false, // is normalized?
            16 * 4, 6 * 4); // stride and offset
        gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_TEXCOORD0);

        gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_BONEIDS,
            4, //
            gl.FLOAT,
            false,
            16 * 4, 8 * 4); // stride and offset
        gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_BONEIDS);

        gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_BONEWEIGHTS,
            4, // 
            gl.FLOAT,
            false, // is normalized?
            16 * 4, 12 * 4); // stride and offset
        gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_BONEWEIGHTS);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.vboElement = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vboElement);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeIndices, gl.STATIC_DRAW);

        gl.bindVertexArray(null);

        this.albedoMap = loadTexture("res/johnny/albedo.png");
        this.normalMap = loadTexture("res/johnny/normal.png");
        this.metallicMap = loadTexture("res/johnny/metallic.png");
        this.roughnessMap = loadTexture("res/johnny/roughness.png");
        this.aoMap = loadTexture("res/johnny/ao.png");
    },

    uninit: function () {
        gl.deleteTexture(this.albedoMap);
        gl.deleteTexture(this.normalMap);
        gl.deleteTexture(this.metallicMap);
        gl.deleteTexture(this.roughnessMap);
        gl.deleteTexture(this.aoMap);

        if (this.vaoCube) {
            gl.deleteVertexArray(this.vaoCube);
            this.vaoCube = null;
        }

        if (this.vboCube) {
            gl.deleteBuffer(this.vboCube);
            this.vboCube = null;
        }

        if (this.vboElement) {
            gl.deleteBuffer(this.vboElement);
            this.vboElement = null;
        }

        if (this.shaderProgramObject) {
            if (this.fragmentShaderObject) {
                gl.detachShader(this.shaderProgramObject, this.fragmentShaderObject);
                gl.deleteShader(this.fragmentShaderObject);
                this.fragmentShaderObject = null;
            }

            if (this.vertexShaderObject) {
                gl.detachShader(this.shaderProgramObject, this.vertexShaderObject);
                gl.deleteShader(this.vertexShaderObject);
                this.vertexShaderObject = null;
            }

            gl.deleteProgram(this.shaderProgramObject);
            this.shaderProgramObject = null;
        }
    },

    resize: function () {
        // perspective projection
        mat4.perspective(this.perspectiveProjectionMatrix, 45.0, parseFloat(canvas.width) / parseFloat(canvas.height), 0.1, 1000);
    },

    display: function () {
        gl.useProgram(this.shaderProgramObject);

        var modelMatrix = mat4.create();
        var viewMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [0.0, -2.0, -15.0]);
        mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 0.1]);

        viewMatrix = camera.getViewMatrix();

        gl.uniformMatrix4fv(this.mUniform, false, modelMatrix);
        gl.uniformMatrix4fv(this.vUniform, false, viewMatrix);
        gl.uniformMatrix4fv(this.pUniform, false, this.perspectiveProjectionMatrix);

        // bind with textures
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.albedoMap);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.normalMap);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.metallicMap);

        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, this.roughnessMap);

        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, this.aoMap);

        gl.uniformMatrix4fv(this.boneMatrixUniform, gl.FALSE, jwAnim[this.t]);

        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vboElement);
        gl.drawElements(gl.TRIANGLES, this.numElements, gl.UNSIGNED_INT, 0);
        gl.bindVertexArray(null);
        gl.useProgram(null);
    },

    update: function () {
        this.t += 1;
        if (this.t >= jwAnim.length) {
            this.t = 0.0;
            // return true;
        }
        return false;
    },
}
