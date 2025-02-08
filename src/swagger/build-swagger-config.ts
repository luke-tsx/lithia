import {
  extractDynamicParams,
  getRoutesFromManifest,
  importRouteModule,
} from 'lithia/core';
import {
  DeepPartial,
  Lithia,
  MatchedMethodSuffix,
  OpenApiSpec,
  Operation,
  Route,
} from 'lithia/types';

function replaceDynamicParamsInPath(
  routePath: string,
  dynamicParams: Record<string, string>,
): string {
  let transformed = routePath;
  for (const param of Object.keys(dynamicParams)) {
    transformed = transformed.replace(`:${param}`, `{${param}}`);
  }
  return transformed;
}

function buildPathParameters(
  dynamicParams: Record<string, string>,
): Array<{ in: 'path'; name: string; required: true }> {
  return Object.keys(dynamicParams).map((param) => ({
    in: 'path',
    name: param,
    required: true,
  }));
}

async function addRouteToSpec(
  route: Route,
  specPaths: OpenApiSpec['paths'],
  env: string,
): Promise<void> {
  const defaultMethods: MatchedMethodSuffix[] = [
    'get',
    'post',
    'put',
    'delete',
    'patch',
    'head',
    'options',
  ];
  const methodsToProcess = route.method
    ? [route.method.toLowerCase() as MatchedMethodSuffix]
    : defaultMethods;

  const module = await importRouteModule(route, env);
  if (!module.metadata?.openAPI) return;

  const dynamicParams = extractDynamicParams(
    route.path.replace(/:\w+/g, ''),
    route,
  );
  const path = replaceDynamicParamsInPath(route.path, dynamicParams);

  Object.assign(specPaths, { [path]: {} });

  for (const method of methodsToProcess) {
    const methodSpec: DeepPartial<Operation> = {};

    Object.assign(methodSpec, module.metadata.openAPI);
    Object.assign(methodSpec, {
      parameters: [
        ...(module.metadata.openAPI?.parameters || []),
        ...buildPathParameters(dynamicParams),
      ],
    });

    Object.assign(specPaths[path], { [method]: methodSpec });
  }
}

export async function buildSwaggerConfig(
  lithia: Lithia,
  config: Pick<OpenApiSpec, 'openapi' | 'info'>,
): Promise<OpenApiSpec> {
  const spec: OpenApiSpec = {
    openapi: '3.0.0',
    info: config.info,
    paths: {},
  };
  const routes = getRoutesFromManifest(lithia);
  await Promise.all(
    routes.map((route) =>
      addRouteToSpec(route, spec.paths, lithia.options._env),
    ),
  );
  return spec;
}
