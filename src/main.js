import plugin from '../plugin.json';

class LunyxAIPro {

  async init() {
    // plugin initialisation
  }

  async destroy() {
    // plugin clean up
  }
}

if (window.acode) {
  const LunyxExtension = new AIPro();
  acode.setPluginInit(plugin.id, async (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
    if (!baseUrl.endsWith('/')) {
      baseUrl += '/';
    }
    LunyxExtension.baseUrl = baseUrl;
    await LunyxExtension.init($page, cacheFile, cacheFileUrl);
  });
  acode.setPluginUnmount(plugin.id, () => {
    LunyxExtension.destroy();
  });
}
