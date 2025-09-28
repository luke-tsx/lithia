/**
 * Represents the root document of an OpenAPI Specification.
 */
export type OpenApiSpec = {
  /**
   * The version of the OpenAPI Specification being used.
   */
  openapi: string;

  /**
   * Provides metadata about the API.
   */
  info: Info;

  /**
   * An array of server objects that provide connectivity information to a target server.
   */
  servers?: Server[];

  /**
   * A list of tags used by the specification with additional metadata.
   */
  tags?: Tag[];

  /**
   * The available paths and operations for the API.
   */
  paths: Paths;

  /**
   * Reusable components such as schemas, parameters, responses, etc.
   */
  components?: Components;

  /**
   * A declaration of which security mechanisms can be used across the API.
   */
  security?: SecurityRequirement[];

  /**
   * Additional external documentation.
   */
  externalDocs?: ExternalDocumentation;
};

/**
 * Metadata about the API.
 */
export type Info = {
  /**
   * The title of the API.
   */
  title: string;

  /**
   * A short description of the API.
   */
  description?: string;

  /**
   * A URL to the Terms of Service for the API.
   */
  termsOfService?: string;

  /**
   * Contact information for the exposed API.
   */
  contact?: Contact;

  /**
   * License information for the exposed API.
   */
  license?: License;

  /**
   * The version of the API.
   */
  version: string;
};

/**
 * Contact information for the exposed API.
 */
export type Contact = {
  /**
   * The identifying name of the contact person/organization.
   */
  name?: string;

  /**
   * The URL pointing to the contact information.
   */
  url?: string;

  /**
   * The email address of the contact person/organization.
   */
  email?: string;
};

/**
 * License information for the exposed API.
 */
export type License = {
  /**
   * The license name used for the API.
   */
  name: string;

  /**
   * A URL to the license used for the API.
   */
  url?: string;
};

/**
 * A server object provides connectivity information to a target server.
 */
export type Server = {
  /**
   * A URL to the target host.
   */
  url: string;

  /**
   * A description of the host.
   */
  description?: string;

  /**
   * Variables used in the server URL.
   */
  variables?: Record<string, ServerVariable>;
};

/**
 * Describes a variable used in a server URL.
 */
export type ServerVariable = {
  /**
   * The default value to use for substitution.
   */
  default: string;

  /**
   * An optional description for the server variable.
   */
  description?: string;

  /**
   * An enumeration of string values to be used if the substitution options are limited.
   */
  enum?: string[];
};

/**
 * A tag used by the specification with additional metadata.
 */
export type Tag = {
  /**
   * The name of the tag.
   */
  name: string;

  /**
   * A short description for the tag.
   */
  description?: string;

  /**
   * Additional external documentation for this tag.
   */
  externalDocs?: ExternalDocumentation;
};

/**
 * Holds the relative paths to the individual endpoints and their operations.
 */
export type Paths = Record<string, PathItem>;

/**
 * Describes the operations available on a single path.
 */
export type PathItem = {
  /**
   * A summary of the operations for this path.
   */
  summary?: string;

  /**
   * A detailed description of the operations for this path.
   */
  description?: string;

  /**
   * A definition of a GET operation on this path.
   */
  get?: Operation;

  /**
   * A definition of a PUT operation on this path.
   */
  put?: Operation;

  /**
   * A definition of a POST operation on this path.
   */
  post?: Operation;

  /**
   * A definition of a DELETE operation on this path.
   */
  delete?: Operation;

  /**
   * A definition of a PATCH operation on this path.
   */
  patch?: Operation;

  /**
   * A list of parameters common to all operations in this path.
   */
  parameters?: Parameter[];
};

/**
 * Describes a single API operation on a path.
 */
export type Operation = {
  /**
   * A list of tags for API documentation control.
   */
  tags?: string[];

  /**
   * A short summary of what the operation does.
   */
  summary?: string;

  /**
   * A verbose explanation of the operation behavior.
   */
  description?: string;

  /**
   * Additional external documentation for this operation.
   */
  externalDocs?: ExternalDocumentation;

  /**
   * Unique string used to identify the operation.
   */
  operationId?: string;

  /**
   * A list of parameters that are applicable for this operation.
   */
  parameters?: Parameter[];

  /**
   * The request body applicable for this operation.
   */
  requestBody?: RequestBody;

  /**
   * The list of possible responses as they are returned from executing this operation.
   */
  responses: Responses;

  /**
   * Declares this operation to be deprecated.
   */
  deprecated?: boolean;
};

/**
 * Describes a single operation parameter.
 */
export type Parameter = {
  /**
   * The name of the parameter.
   */
  name: string;

  /**
   * The location of the parameter.
   */
  in: 'query' | 'header' | 'path' | 'cookie';

  /**
   * A brief description of the parameter.
   */
  description?: string;

  /**
   * Determines whether this parameter is mandatory.
   */
  required?: boolean;

  /**
   * Specifies that a parameter is deprecated and should be transitioned out of usage.
   */
  deprecated?: boolean;

  /**
   * The schema defining the type used for the parameter.
   */
  schema?: Schema;

  /**
   * Example of the parameter's potential value.
   */
  example?: any;
};

/**
 * Describes a single request body.
 */
export type RequestBody = {
  /**
   * A brief description of the request body.
   */
  description?: string;

  /**
   * The content of the request body.
   */
  content: Record<string, MediaType>;

  /**
   * Determines if the request body is required in the request.
   */
  required?: boolean;
};

/**
 * Describes a single response from an API Operation.
 */
export type Response = {
  /**
   * A short description of the response.
   */
  description: string;

  /**
   * Maps a header name to its definition.
   */
  headers?: Record<string, Header>;

  /**
   * A map containing descriptions of potential response payloads.
   */
  content?: Record<string, MediaType>;
};

/**
 * Describes a single media type.
 */
export type MediaType = {
  /**
   * The schema defining the content of the request/response.
   */
  schema?: Schema;

  /**
   * Example of the media type.
   */
  example?: any;
};

/**
 * Describes a single schema.
 */
export type Schema = {
  /**
   * The type of the data.
   */
  type?: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';

  /**
   * The format of the data.
   */
  format?: string;

  /**
   * A brief description of the schema.
   */
  description?: string;

  /**
   * The default value associated with the schema.
   */
  default?: any;

  /**
   * A list of required properties for an object schema.
   */
  required?: string[];

  /**
   * A map of property names to their schemas for object types.
   */
  properties?: Record<string, Schema>;

  /**
   * Additional properties allowed for an object schema.
   */
  additionalProperties?: boolean | Schema;

  /**
   * The schema for array items.
   */
  items?: Schema;
};

/**
 * Describes reusable components.
 */
export type Components = {
  /**
   * A map of reusable schemas.
   */
  schemas?: Record<string, Schema>;

  /**
   * A map of reusable responses.
   */
  responses?: Record<string, Response>;

  /**
   * A map of reusable parameters.
   */
  parameters?: Record<string, Parameter>;

  /**
   * A map of reusable request bodies.
   */
  requestBodies?: Record<string, RequestBody>;
};

/**
 * Describes external documentation.
 */
export type ExternalDocumentation = {
  /**
   * A short description of the target documentation.
   */
  description?: string;

  /**
   * The URL for the target documentation.
   */
  url: string;
};

/**
 * Describes a security requirement.
 */
export type SecurityRequirement = Record<string, string[]>;

/**
 * Describes a single header.
 */
export type Header = Omit<Parameter, 'name' | 'in'>;

/**
 * A map of HTTP status codes to their corresponding responses.
 */
export type Responses = Record<string, Response>;
