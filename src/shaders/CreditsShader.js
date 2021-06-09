const CreditsShader = {
    program: 0,
    uniforms: {},

    init: function () {
        // vertex shader
        var vertexShaderSourceCode =
           	"#version 300 es \n"+
	        "\n"+

            "precision highp float; \n" +
            "precision highp int; \n" +

	        "in vec4 vPosition; \n" +
	        "in vec2 vTexcoord; \n" +
	        "in vec3 vNormal; \n" +

	        "uniform vec3 u_lD; \n" +
	        "uniform vec3 u_kD; \n" +
	        "uniform vec4 u_light_position; \n" +
	        "uniform mat4 u_projection_matrix; \n" +
	        "uniform mat4 u_model_matrix; \n" +
	        "uniform mat4 u_view_matrix; \n" +

	        "out vec2 out_texcoord; \n" +
	        "out vec3 transformed_normal; \n" +
	        "out vec3 light_direction; \n" +
	        "out vec3 view_vector; \n" +
	        "out float distance; \n" +

	        "void main(void) \n" +
	        "{ \n" +
	        "	vec4 eye_coordinates = u_view_matrix * u_model_matrix * vPosition; \n" +
	        "	transformed_normal = mat3(u_view_matrix * u_model_matrix) * vNormal; \n" +
	        "	light_direction = vec3(u_light_position - eye_coordinates); \n" +
	        "	view_vector = -eye_coordinates.xyz; \n" +
	        "	distance = length(u_light_position - vPosition);" +
	        "	gl_Position = u_projection_matrix * u_view_matrix * u_model_matrix * vPosition; \n" +
	        "	out_texcoord = vTexcoord; \n" +
	        "} \n";

        var vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShaderObject, vertexShaderSourceCode);
        gl.compileShader(vertexShaderObject);

        if (!gl.getShaderParameter(vertexShaderObject, gl.COMPILE_STATUS)) {
            var error = gl.getShaderInfoLog(vertexShaderObject);
            if (error.length > 0) {
                alert("Credits vertex " + error);
                return false;
            }
        }

        // fragment shader
        var fragmentShaderSourceCode =
            "#version 300 es \n" +
             "\n"+

            "precision highp float; \n" +
            "precision highp int; \n" +

            "in vec3 transformed_normal; \n" +
			"in vec3 light_direction; \n" +
			"in vec3 view_vector; \n" +
			"in vec2 out_texcoord; \n" +
			"in float distance; \n" +

			"uniform sampler2D u_texture_sampler; \n" +
			"uniform float u_materialShininess; \n" +
			"uniform vec3 u_lA; \n" +
			"uniform vec3 u_lD; \n" +
			"uniform vec3 u_lS; \n" +
			"uniform vec3 u_light_target; \n" /*light direction*/ +
			"uniform float u_light_cutoff; \n" +
			"uniform float u_light_outer_cutoff; \n" +
			"uniform float u_light_constant; \n" +
			"uniform float u_light_linear; \n" +
			"uniform float u_light_quadratic; \n" +
			"uniform float u_alpha; \n" +

			"out vec4 FragColor; \n" +
			"vec3 phong_ads_light; \n" +

			"void main(void) \n" +
			"{ \n" +
			"	vec3 normalized_transformed_normals = normalize(transformed_normal); \n" +
			"	vec3 normalized_light_direction = normalize(light_direction); \n" +
			"	vec3 normalized_view_vector = normalize(view_vector); \n" +
			"	vec3 reflection_vector = reflect(-normalized_light_direction, normalized_transformed_normals); \n" +
			"	vec3 ambient = u_lA * texture(u_texture_sampler, out_texcoord).rgb; \n" +
			"	vec3 diffuse = u_lD * max(dot(normalized_light_direction, normalized_transformed_normals), 0.0) * texture(u_texture_sampler, out_texcoord).rgb; \n" +
			"	vec3 specular = u_lS * pow(max(dot(reflection_vector, normalized_view_vector), 0.0), u_materialShininess) * texture(u_texture_sampler, out_texcoord).rgb; \n" +
			"	float theta = dot(normalized_light_direction, normalize(-u_light_target)); \n" +
			"	float epsilon = (u_light_cutoff - u_light_outer_cutoff); \n" +
			"	float intensity = clamp((theta - u_light_outer_cutoff) / epsilon, 0.0, 1.0); \n" +
			"	diffuse *= intensity; \n" +
			"	specular *= intensity; \n" +
			"	float attenuation = 1.0 / (u_light_constant + u_light_linear * distance + u_light_quadratic * (distance * distance)); \n" +
			"	ambient *= attenuation; \n" +
			"	diffuse *= attenuation; \n" +
			"	specular *= attenuation; \n" +
			"	phong_ads_light = ambient + diffuse + specular; \n" +
			"	FragColor = vec4(phong_ads_light, u_alpha); \n" +
			"} \n";

        var fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShaderObject, fragmentShaderSourceCode);
        gl.compileShader(fragmentShaderObject);

        if (!gl.getShaderParameter(fragmentShaderObject, gl.COMPILE_STATUS)) {
            var error = gl.getShaderInfoLog(fragmentShaderObject);
            if (error.length > 0) {
                alert("Credits fragment" + error);
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
		gl.bindAttribLocation(this.program, WebGLMacros.AMC_ATTRIBUTE_NORMAL, "vNormal");

        // linking
        gl.linkProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            var error = gl.getProgramInfoLog(this.program);
            if (error.length > 0) {
                alert("Credits shader " + error);
                return false;
            }
        }

        // post-linking get uniform location
        this.uniforms.mUniform = gl.getUniformLocation(this.program, "u_model_matrix");
        this.uniforms.vUniform = gl.getUniformLocation(this.program, "u_view_matrix");
        this.uniforms.pUniform = gl.getUniformLocation(this.program, "u_projection_matrix");

		this.uniforms.lAUniform = gl.getUniformLocation(this.program, "u_lA");
		this.uniforms.lDUniform = gl.getUniformLocation(this.program, "u_lD");
		this.uniforms.lSUniform = gl.getUniformLocation(this.program, "u_lS");

		this.uniforms.lightPositionUniform = gl.getUniformLocation(this.program, "u_light_position");
		this.uniforms.lightTargetUniform = gl.getUniformLocation(this.program, "u_light_target");
		this.uniforms.lightCutoffUniform = gl.getUniformLocation(this.program, "u_light_cutoff");
		this.uniforms.lightOuterCutoffUniform = gl.getUniformLocation(this.program, "u_light_outer_cutoff");
		this.uniforms.lightConstantUniform = gl.getUniformLocation(this.program, "u_light_constant");
		this.uniforms.lightLinearUniform = gl.getUniformLocation(this.program, "u_light_linear");
		this.uniforms.lightQuadraticUniform = gl.getUniformLocation(this.program, "u_light_quadratic");

		this.uniforms.alphaUniform = gl.getUniformLocation(this.program, "u_alpha");
		this.uniforms.textureSamplerUniform = gl.getUniformLocation(this.program, "u_texture_sampler");
		this.uniforms.kShininessUniform = gl.getUniformLocation(this.program, "u_materialShininess");

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
