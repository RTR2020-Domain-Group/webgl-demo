// init all shaders
function initShaders() {
    if (!SkyboxShader.init()) return false;
    if (!TextureShader.init()) return false;
    if (!GrainShader.init()) return false;
    if (!PBRshader.init()) return false;
    if (!PBRshaderWhite.init()) return false;
    if (!PBRStaticShader.init()) return false;
    if (!PBRStaticShaderWhite.init()) return false;
    if (!CreditsShader.init()) return false;
    if (!TerrainShader.init()) return false;
    if (!TerrainShaderWhite.init()) return false;
    if (!TreeShader.init()) return false;

    return true;
}

// uninit all shaders
function uninitShaders() {
    SkyboxShader.uninit();
    TextureShader.uninit();
    GrainShader.uninit();
    PBRshader.uninit();
    PBRshaderWhite.uninit();
    PBRStaticShader.uninit();
    PBRStaticShaderWhite.uninit();
    CreditsShader.uninit();
    TerrainShader.uninit();
    TerrainShaderWhite.uninit();
    TreeShader.uninit();
}
