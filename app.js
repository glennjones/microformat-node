"use strict";
require("dotenv").config();
const Hapi = require("@hapi/hapi");
const Joi = require("@hapi/joi");
const Inert = require("@hapi/inert");
const Vision = require("@hapi/vision");
const Blipp = require("blipp");
const Pack = require("./package.json");
const Microformats = require("./index.js");

const schema = Joi.object({
  url: Joi.string(),
  html: Joi.string().description("The html to parse"),
  baseUrl: Joi.string()
    .allow("")
    .description("Optional URL to help resolve relative links"),
  filters: Joi.string()
    .allow("")
    .description("Optional comma separted list of formats to filter by"),
  overlappingVersions: Joi.boolean(),
  impliedPropertiesByVersion: Joi.boolean(),
  parseLatLonGeo: Joi.boolean(),
  dateFormat: Joi.string(),
  textFormat: Joi.string(),
});


async function countHTML(request, reply) {
  let options = await buildOptions(request);
  const mfObj = Microformats.count(options);
  return reply(JSON.stringify(mfObj)).type("application/json");
}

async function buildOptions(request) {
  let options = {};

  if (request.payload.html !== undefined) {
    options.html = request.payload.html.trim();
  }

  if (request.payload.baseUrl !== undefined) {
    options.baseUrl = request.payload.baseUrl.trim();
  }

  if (request.payload.filters !== undefined) {
    if (request.payload.filters.indexOf(",") > -1) {
      options.filters = trimArray(request.payload.filters.split(","));
    } else {
      options.filters = trimArray(request.payload.filters);
    }
    if (options.filters.length === 0) {
      delete options.filters;
    }
  }

  if (request.payload.dateFormat !== undefined) {
    options.dateFormat = request.payload.dateFormat;
  }

  if (request.payload.textFormat !== undefined) {
    options.textFormat = request.payload.textFormat;
  }

  if (request.payload.overlappingVersions !== undefined) {
    options.overlappingVersions = request.payload.overlappingVersions;
  }

  if (request.payload.impliedPropertiesByVersion !== undefined) {
    options.impliedPropertiesByVersion =
      request.payload.impliedPropertiesByVersion;
  }

  if (request.payload.parseLatLonGeo !== undefined) {
    options.parseLatLonGeo = request.payload.parseLatLonGeo;
  }

  if (request.payload.url !== undefined) {
    try {
      const response = await fetch(request.payload.url);
      if (response.ok) {
        options.html = await response.text();
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("An error occurred:", error);
      throw error; // re-throw the error to be handled by the caller
    }
  }

  return options;
}

function trimArray(obj) {
  let out = [];
  if (Array.isArray(obj)) {
    obj.forEach(function (txt) {
      if (obj.trim() !== "") {
        out.push(obj.trim());
      }
    });
  } else {
    if (obj.trim() !== "") {
      out.push(obj.trim());
    }
  }
  return out;
}

// Create a server with a host and port
const server = Hapi.server({
  host: process.env.PORT ? "0.0.0.0" : "localhost",
  port: parseInt(process.env.PORT, 10) || 3001,
  router: {
    stripTrailingSlash: true,
  },
  routes: { cors: true },
});

async function startServer() {
  await server.register([Inert, Vision, Blipp]);

  // add templates support with handlebars
  server.views({
    path: "templates",
    engines: { html: require("handlebars") },
    partialsPath: "./templates/withPartials",
    helpersPath: "./templates/helpers",
    isCached: false,
  });

  // setup routes to serve the test directory and file routes into other modules
  server.route([
    {
      method: "GET",
      path: "/",
      handler: (request, h) => {
        return h.view("index.html", {
          title: Pack.name,
          version: Pack.version,
        });
      },
    },
    {
      method: "POST",
      path: "/parse",
      options: {
        payload: {
          multipart: true
        },
        handler: async (request, h) => {
          try {
            const options = await buildOptions(request);
            const mfObj = Microformats.get(options);
            return h.response(JSON.stringify(mfObj)).type("application/json");
          } catch (err) {
            return h.response({ err: err.message }).type("application/json").code(500);
          }
        },
        validate: {
          payload: schema,
        },
      },
    },
    {
      method: "POST",
      path: "/count",
      options: {
        payload: {
          multipart: true
        },
        handler: async (request, h) => {
            try {
              const options = await buildOptions(request);
              const mfObj = Microformats.count(options);
              return h.response(JSON.stringify(mfObj)).type("application/json");
            } catch (err) {
              return h.response({ err: err.message }).type("application/json").code(500);
            }
          },
        validate: {
          payload: schema,
        },
      },
    },
    {
      method: "GET",
      path: "/{path*}",
      handler: {
        directory: {
          path: "./static",
        },
      },
    },
  ]);

  await server.start();
  console.log("Server running at:", server.info.uri);
}

startServer().catch((error) => {
  console.error(error);
});
