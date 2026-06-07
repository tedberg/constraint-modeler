import type { App, DefineComponent, Plugin } from "vue";

export interface ConstraintModelerProperty {
  path: string;
  displayName: string;
  simpleDataType: string;
  dataType: string;
  expectedDataMagnitude?: number | null;
  keyDisplayPropertyPath?: string | null;
  relationship?: boolean;
  multiProperty?: boolean;
  nestedPropertyList?: ConstraintModelerProperty[] | null;
  nestedMultiPropertyList?: ConstraintModelerProperty[] | null;
}

export interface ConstraintModelerPropertiesResponse {
  propertyList?: ConstraintModelerProperty[];
  multiPropertyList?: ConstraintModelerProperty[];
}

export interface ConstraintModelerValueListEntry {
  identifyingValue: string | number | boolean;
  displayValue: string;
}

export interface ConstraintModelerValueListResponse {
  data: ConstraintModelerValueListEntry[];
}

export interface ConstraintModelerValidationEntry {
  objectId: string | number;
  constraint: string;
  valid: boolean;
  invalidReason?: string | null;
}

export interface ConstraintModelerValidationResponse {
  success: boolean;
  data?: ConstraintModelerValidationEntry[];
}

export interface ConstraintModelerApplyResponse {
  success?: boolean;
  data?: unknown;
  totalRows?: number;
  queryTotalRows?: number;
  page?: number;
  [key: string]: unknown;
}

export interface ConstraintModelerResourceLike {
  loadValueList(serverDataType: string): Promise<ConstraintModelerValueListResponse | unknown>;
  loadProperties(objectName: string): Promise<ConstraintModelerPropertiesResponse | unknown>;
  validateConstraintModeler(
    className: string,
    constraintList: string,
  ): Promise<ConstraintModelerValidationResponse | unknown>;
  loadResultWithConstraints(
    className: string,
    urlEncodedConstraintQueryString: string,
  ): Promise<ConstraintModelerApplyResponse | unknown>;
}

export interface ConstraintModelerProps {
  objectName: string;
  title?: string | null;
  showDebug?: boolean;
  exposeProjectionModeler?: boolean;
  initialModelJsonObject?: Record<string, unknown> | null;
  constraintModelerResource?: ConstraintModelerResourceLike;
  saveFunction?: ((model: unknown, isValid: boolean) => Promise<unknown>) | null;
}

export type ConstraintModelerEvents = {
  applyConstraintsToData: [result: ConstraintModelerApplyResponse | unknown];
};

export declare class AbstractConstraintModelerResource implements ConstraintModelerResourceLike {
  getJson(url: string): Promise<unknown>;
  getJsonWithParams(url: string, params?: Record<string, string> | null): Promise<unknown>;
  loadValueList(serverDataType: string): Promise<ConstraintModelerValueListResponse | unknown>;
  loadProperties(objectName: string): Promise<ConstraintModelerPropertiesResponse | unknown>;
  validateConstraintModeler(
    className: string,
    constraintList: string,
  ): Promise<ConstraintModelerValidationResponse | unknown>;
  loadResultWithConstraints(
    className: string,
    urlEncodedConstraintQueryString: string,
  ): Promise<ConstraintModelerApplyResponse | unknown>;
  static implementsRequiredMethods(obj: unknown): obj is ConstraintModelerResourceLike;
  static isValidImplementation(obj: unknown): obj is ConstraintModelerResourceLike;
}

export declare class ConstraintModelerResource extends AbstractConstraintModelerResource {}

export declare const ConstraintModeler: DefineComponent<ConstraintModelerProps>;

declare const plugin: Plugin & {
  install(app: App): void;
};

export default plugin;
