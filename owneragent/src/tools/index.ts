import type { ToolDefinition, ToolHandler } from "../types.js";
import { readFileDefinition, createReadFileHandler } from "./read-file.js";
import { writeFileDefinition, createWriteFileHandler } from "./write-file.js";
import { listProductsDefinition, createListProductsHandler } from "./list-products.js";
import { getCmsLocaleDefinition, createGetCmsLocaleHandler } from "./get-cms-locale.js";
import { updateCmsLocaleDefinition, createUpdateCmsLocaleHandler } from "./update-cms-locale.js";
import { createProductDefinition, createCreateProductHandler } from "./create-product.js";
import { updateProductDefinition, createUpdateProductHandler } from "./update-product.js";

export interface ToolRegistry {
  definitions: ToolDefinition[];
  handlers: Map<string, ToolHandler>;
}

export function registerTools(templatePath: string): ToolRegistry {
  const definitions: ToolDefinition[] = [
    readFileDefinition,
    writeFileDefinition,
    listProductsDefinition,
    getCmsLocaleDefinition,
    updateCmsLocaleDefinition,
    createProductDefinition,
    updateProductDefinition,
  ];

  const handlers = new Map<string, ToolHandler>();
  handlers.set("read_file", createReadFileHandler(templatePath));
  handlers.set("write_file", createWriteFileHandler(templatePath));
  handlers.set("list_products", createListProductsHandler(templatePath));
  handlers.set("get_cms_locale", createGetCmsLocaleHandler(templatePath));
  handlers.set("update_cms_locale", createUpdateCmsLocaleHandler(templatePath));
  handlers.set("create_product", createCreateProductHandler(templatePath));
  handlers.set("update_product", createUpdateProductHandler(templatePath));

  return { definitions, handlers };
}
