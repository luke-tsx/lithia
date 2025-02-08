type SwaggerUIProps = {
  title: string;
  baseUrl: string;
};

export function buildSwaggerUI(props: SwaggerUIProps) {
  return `
<!-- HTML for static distribution bundle build -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>${props.title}</title>
    <link rel="stylesheet" type="text/css" href="${props.baseUrl}/swagger-ui.css" />
    <link rel="stylesheet" type="text/css" href="${props.baseUrl}/index.css" />
    <link rel="icon" type="image/png" href="${props.baseUrl}/favicon-32x32.png" sizes="32x32" />
    <link rel="icon" type="image/png" href="${props.baseUrl}/favicon-16x16.png" sizes="16x16" />
    <style>
      html
      {
        box-sizing: border-box;
        overflow: -moz-scrollbars-vertical;
        overflow-y: scroll;
      }
      *,
      *:before,
      *:after
      {
        box-sizing: inherit;
      }

      body {
        margin:0;
        background: #fafafa;
      }
    </style>
  </head>

  <body>
    <div id="swagger-ui"></div>
    <script src="${props.baseUrl}/swagger-ui-bundle.js" charset="UTF-8"> </script>
    <script src="${props.baseUrl}/swagger-ui-standalone-preset.js" charset="UTF-8"> </script>
    <script src="${props.baseUrl}/swagger-initializer.js" charset="UTF-8"> </script>
  </body>
</html>
  `;
}
