const SkyboxShader = {
    uniforms: {

    },

    vertexShaderObject:0,
    fragmentShaderObject:0,
    shaderProgramObject:0,

    gVao:0, 
    gVboPositon:0,
    gMVPMatrixUniform:0,
    gPespectiveProjectionMatrix:0,

    skybox_texture:0,
    skybox_front_texture:0,
    skybox_back_texture:0,
    skybox_left_texture:0,
    skybox_right_texture:0,
    skybox_top_texture:0,
    skybox_bottom_texture:0,

    init : function() {

        /**
         * Vertex Shader
         */
        this.vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);

        var sourceVertexShader = 
        "#version 300 es\n"+
        "layout (location = 0) in vec3 vPosition;\n"+
        "uniform mat4 u_mvp_matrix;\n"+
        "out vec3 out_texCoords;\n"+
        "void main(void)\n"+
        "{\n"+
        "   out_texCoords = vPosition;\n"+
        "   gl_Position = u_mvp_matrix * vec4(vPosition, 1.0);\n"+
        "}\n";

        gl.shaderSource(this.vertexShaderObject, sourceVertexShader);
        gl.compileShader(this.vertexShaderObject);

        if(gl.getShaderParameter(this.vertexShaderObject, gl.COMPILE_STATUS)) {
            var error = gl.getShaderInfoLog(this.vertexShaderObject);
            if(error.length > 0) {
                alert("Skybox Vertex Shader log: "+ error);
                return false;
            }
        }

        /**
         * Fragment Shader
         */

        this.fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);

        var sourceFragmentShader =
        "#version 300 es\n"+
        "precision highp float;\n"+
        "in vec3 out_texCoords;\n"+
        "out vec4 FragColor;\n"+
        "uniform samplerCube skybox;\n"+
        "void main(void)\n"+
        "{\n"+
        "     FragColor = texture(skybox, out_texCoords);\n"+
        "}\n";


        gl.shaderSource(this.fragmentShaderObject, sourceFragmentShader);
        gl.compileShader(this.fragmentShaderObject);

        if(!gl.getShaderParameter(this.fragmentShaderObject, gl.COMPILE_STATUS)) {
            var error = gl.getShaderInfoLog(this.fragmentShaderObject);
            if(error.length > 0) {
                alert("Skybox Fragment Shader log: "+ error);
                return false;
            }
        }

        /**
         * Shader Program
         */

        this.shaderProgramObject = gl.createProgram();

        gl.attachShader(this.shaderProgramObject, this.vertexShaderObject);
        gl.attachShader(this.shaderProgramObject, this.fragmentShaderObject);

        gl.bindAttribLocation(this.shaderProgramObject, WebGLMacros.AMC_ATTRIBUTE_VERTEX, "vPosition");
        
        gl.linkProgram(this.shaderProgramObject);

        if(gl.getProgramParameter(this.shaderProgramObject, gl.LINK_STATUS) == false) {
            var error = gl.getProgramInfoLog(this.shaderProgramObject);

            if(error.length > 0) {
                alert("Skybox Program linking log: "+ error);
                return false;
            }
        }        

        this.gMVPMatrixUniform = gl.getUniformLocation(this.shaderProgramObject, "u_mvp_matrix");

        var skyboxVertices = new Float32Array([
            // positions          
            -1.0,  1.0, -1.0,
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
            -1.0,  1.0, -1.0,
    
            -1.0, -1.0,  1.0,
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
            -1.0, -1.0,  1.0,
    
             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0,
             1.0,  1.0,  1.0,
             1.0,  1.0,  1.0,
             1.0,  1.0, -1.0,
             1.0, -1.0, -1.0,
    
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
             1.0,  1.0,  1.0,
             1.0,  1.0,  1.0,
             1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,
    
            -1.0,  1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,
             1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0,
    
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0
        ]);


        this.gVao = gl.createVertexArray();
        gl.bindVertexArray(this.gVao);

        this.gVboPositon = gl.createBuffer();
        gl.bindBuffer(this.shaderProgramObject, this.gVboPositon);
        gl.bufferData(gl.ARRAY_BUFFER, skyboxVertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_VERTEX, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_VERTEX);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
        
        //Texture code        

        this.loadTextureCube();
        /*var textures = new Array(6);
        
        textures[0] = "res/skybox/right.png";
        textures[1] = "res/skybox/left.png";
        textures[2] = "res/skybox/top.png";
        textures[3] = "res/skybox/bottom.png";
        textures[4] = "res/skybox/front.png";
        textures[5] = "res/skybox/back.png";



	    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        skybox_texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox_texture);

        var temp_texture = new Array(6);

        var i = 0;
        for(i = 0; i < 6; i++) {
            temp_texture[i] = gl.createTexture();
            temp_texture[i].image = new Image();
            temp_texture[i].image.src = textures[i];

            temp_texture[i].image.onload = function() {               
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
        
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skybox_texture.image);                
            }
        
        }*/
        return true;
    },

    uninit: function () {
        gl.deleteProgram(this.shaderProgramObject);
    },

    use: function () {
        gl.useProgram(this.shaderProgramObject);
        return this.uniforms;
    },
    

    loadTextureCube : function() {
        var ct = 0;
        var img = new Array(6);
        this.skybox_texture = gl.createTexture();
        var urls = [
            "res/skybox/right.png", "res/skybox/left.png", 
            "res/skybox/top.png", "res/skybox/bottom.png", 
            "res/skybox/front.png", "res/skybox/back.png"
        ];
        for (var i = 0; i < 6; i++) {
            img[i] = new Image();
            img[i].onload = function() {
                ct++;
                if (ct == 6) {
                    this.skybox_texture = gl.createTexture();
                    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.skybox_texture);
                    var targets = [
                        gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 
                        gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 
                        gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z 
                        ];
                    for (var j = 0; j < 6; j++) {
                        gl.texImage2D(targets[i], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img[j]);
                        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

                        
                        
                    }
                    //gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                    //draw();
                }
            }
            img[i].src = urls[i];
        }
    }
}

