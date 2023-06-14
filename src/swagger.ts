import swaggerJSDoc from "swagger-jsdoc";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MultiLogin Instagraam Automation API",
      version: "1.0.0",
      description: "API documentation using Swagger",
    },
    components: {
      schemas: {
        Account: {
          type: "object",
          properties: {
            username: {
              type: "string",
            },
            password: {
              type: "string",
            },
            phoneNumber: {
              type: "string",
            },
          },
        },
        Profile: {
          type: "object",
          properties: {
            uuid: { type: "string" },
            name: { type: "string", required: true },
            notes: { type: "string", default: "Default Notes" },
            googleServices: { type: "boolean", default: true },
            navigator: {
              type: "object",
              required: true,
              properties: {
                userAgent: { type: "string" },
                resolution: { type: "string" },
                language: { type: "string" },
                platform: { type: "string" },
                doNotTrack: { type: "number" },
                hardwareConcurrency: { type: "number" },
              },
            },
            storage: {
              type: "object",
              default: {
                local: true,
                extensions: true,
                bookmarks: false,
                history: false,
                passwords: true,
              },
            },
            network: {
              type: "object",
              required: true,
              properties: {
                proxy: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    host: { type: "string" },
                    port: { type: "string" },
                    username: { type: "string" },
                    password: { type: "string" },
                  },
                },
              },
            },
            plugins: {
              type: "object",
              default: {
                enableVulnerable: false,
                enableFlash: false,
              },
            },
            timezone: {
              type: "object",
              default: {
                mode: "FAKE",
                fillBasedOnExternalIp: true,
                zoneId: null,
              },
            },
            geolocation: {
              type: "object",
              default: {
                mode: "PROMPT",
                fillBasedOnExternalIp: true,
              },
            },
            audioContext: {
              type: "object",
              default: {
                mode: "NOISE",
              },
            },
            canvas: {
              type: "object",
              default: {
                mode: "NOISE",
              },
            },
            fonts: {
              type: "object",
              default: {
                mode: "FAKE",
                maskGlyphs: true,
                families: ["MS Serif", "Segoe UI"],
              },
            },
            mediaDevices: {
              type: "object",
              default: {
                mode: "FAKE",
                videoInputs: 3,
                audioInputs: 2,
                audioOutputs: 2,
              },
            },
            webRTC: {
              type: "object",
              properties: {
                mode: { type: "string" },
                fillBasedOnExternalIp: { type: "boolean" },
                publicIp: { type: "string" },
                localIps: { type: "array", items: { type: "string" } },
              },
            },
            webGL: {
              type: "object",
              default: {
                mode: "NOISE",
              },
            },
            webGLMetadata: {
              type: "object",
              properties: {
                mode: { type: "string" },
                vendor: { type: "string" },
                renderer: { type: "string" },
              },
            },
            extensions: {
              type: "object",
              properties: {
                enable: { type: "boolean" },
                names: { type: "array", items: { type: "string" } },
              },
            },
            ports: {
              type: "object",
              properties: {
                mode: { type: "string" },
                localPortsExclude: { type: "array", items: { type: "number" } },
              },
            },
            browser: { type: "string", required: true, default: "mimic" },
            os: { type: "string", required: true, default: "win" },
            accounts: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Account",
              },
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
            },
          },
        },
      },
    },
  },
  apis: ["**/*.ts"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
