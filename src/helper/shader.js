// init all shaders
function initShaders() {
    if (!SkyboxShader.init()) return false;
    if (!TextureShader.init()) return false;
    if (!GrainShader.init()) return false;
    if (!PBRshader.init()) return false;
    if (!PBRStaticShader.init()) return false;
    if (!CreditsShader.init()) return false;

    return true;
}

// uninit all shaders
function uninitShaders() {
    SkyboxShader.uninit();
    TextureShader.uninit();
    GrainShader.uninit();
    PBRshader.uninit();
    PBRStaticShader.uninit();
    CreditsShader.uninit();
}