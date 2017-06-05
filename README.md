# css-demo

Demo web server and Frontend assets of the Css-Demo, running with fixtures.
Demonstrates the rendering of a dynamic page through reusable components
(pug templates) using Ajax and Express.

## Quick start

Install all dependencies:
```
npm install
```

Run in test mode with fixtures (only mode available):
```
npm run debugDev
```

## Architecture

This repository contains two main areas:

1. The node.js server that calls the internal API's (mocked) and renders this
data into templates. This code is located in `server/` and is split into the
routing per pages, the API abstractions, and the expressjs server.
The only available roots are `/` and `/companies/:cityName`.

2. The client side assets, styles and scripts, and the templates that will be
rendered by the server. These are located in `client/` and are split into
components that are reusable across pages.

The repository also contains the static assets (images, fonts etc), the
configuration files, and a full set of API fixtures necessary to test the
server.

## App Building

The application components and assets are built with gulp tasks and webpack
using best practices.

## Coding Conventions

ESLint is used to ensure that all code follows good conventions - a full list
of preferences is found in the `.eslintrc` file.

## Unit Tests

The Demo contains unit tests that can be run with
```
npm run test
```
