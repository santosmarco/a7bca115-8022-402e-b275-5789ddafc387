import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import SwaggerParser from "@apidevtools/swagger-parser";
import { generateZodClientFromOpenAPI } from "openapi-zod-client";
import type { OpenAPIObject } from "openapi3-ts/oas30";
import { format } from "prettier";
import prettierConfig from "prettier.config";

import { env } from "~/env";

const OPENAPI_PATH = "../src/lib/recall/openapi.json";
const OUTPUT_PATH = "../src/lib/recall/client.ts";

const dirname = path.dirname(fileURLToPath(import.meta.url));

async function generateRecallClient(): Promise<void> {
  try {
    const openApiDoc = (await SwaggerParser.parse(
      path.resolve(dirname, OPENAPI_PATH),
    )) as OpenAPIObject;

    const generatedClient = await generateZodClientFromOpenAPI({
      openApiDoc,
      prettierConfig,
      options: {
        withDocs: true,
        withAlias: true,
        withImplicitRequiredProps: false,
        withAllResponses: false,
        exportAllNamedSchemas: true,
        shouldExportAllSchemas: true,
        shouldExportAllTypes: true,
        groupStrategy: "tag",
        baseUrl: env.RECALL_BASE_URL,
        complexityThreshold: 0,
      },
      templatePath: path.resolve(dirname, "recall-client.hbs"),
      disableWriteToFile: true,
    });

    const formattedCode = await format(
      generatedClient.replace(/\.(optional|nullable)\(\)/g, ".nullish()"),
      {
        ...prettierConfig,
        parser: "typescript",
      },
    );

    await writeFile(path.resolve(dirname, OUTPUT_PATH), formattedCode, "utf-8");

    console.info("✓ Successfully generated Recall API client");
  } catch (error) {
    console.error(
      "Failed to generate Recall API client:",
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
}

void generateRecallClient();
