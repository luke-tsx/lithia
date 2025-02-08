import { OpenApiSpec } from 'lithia/types';

export type SwaggerInitializerProps = {
  spec: OpenApiSpec;
};

export function buildSwaggerInitializerScript(props: SwaggerInitializerProps) {
  return `
window.onload = function() {
  let url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }

  let swaggerOptions = {
    url,
    spec: ${JSON.stringify(props.spec)},
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: 'StandaloneLayout'
  }

  let ui = SwaggerUIBundle(swaggerOptions);

  window.ui = ui;
}
  `;
}
