import test from "node:test";
import assert from "node:assert/strict";
import {
  getViewFromPath,
  VIEWS,
  EMPTY_FORMS,
  parseDashboardRoute,
} from "../dashboardViews.js";

test("getViewFromPath matches home routes", () => {
  assert.equal(getViewFromPath("/dashboard"), "home");
  assert.equal(getViewFromPath("/dashboard/"), "home");
});

test("getViewFromPath matches item-library routes", () => {
  assert.equal(getViewFromPath("/dashboard/items/library"), "item-library");
  assert.equal(getViewFromPath("/dashboard/items/library/new"), "item-library");
  assert.equal(getViewFromPath("/dashboard/items/library/abc"), "item-library");
});

test("getViewFromPath matches categories routes", () => {
  assert.equal(getViewFromPath("/dashboard/items/categories"), "categories");
  assert.equal(getViewFromPath("/dashboard/items/categories/new"), "categories");
  assert.equal(getViewFromPath("/dashboard/items/categories/abc"), "categories");
});

test("getViewFromPath matches modifiers routes", () => {
  assert.equal(getViewFromPath("/dashboard/items/modifiers"), "modifiers");
  assert.equal(getViewFromPath("/dashboard/items/modifiers/new"), "modifiers");
  assert.equal(getViewFromPath("/dashboard/items/modifiers/abc"), "modifiers");
});

test("getViewFromPath matches online ordering routes", () => {
  assert.equal(getViewFromPath("/dashboard/store-setup/review"), "online-ordering");
  assert.equal(getViewFromPath("/store-setup/review"), "online-ordering");
});

test("getViewFromPath returns null for unknown routes", () => {
  assert.equal(getViewFromPath("/unknown"), null);
  assert.equal(getViewFromPath("/dashboard/unknown"), null);
  assert.equal(getViewFromPath(""), null);
  assert.equal(getViewFromPath(null), null);
});

test("EMPTY_FORMS contains required structure", () => {
  assert.ok(EMPTY_FORMS["modifiers"]);
  assert.ok(EMPTY_FORMS["categories"]);
  assert.ok(EMPTY_FORMS["item-library"]);
  assert.equal(EMPTY_FORMS["modifiers"].isCreateModifierOpen, true);
  assert.equal(EMPTY_FORMS["categories"].isCreateCategoryOpen, true);
  assert.equal(EMPTY_FORMS["item-library"].isCreateItemOpen, true);
});

test("VIEWS contains valid configuration", () => {
  assert.equal(VIEWS.home.base, "/dashboard");
  assert.equal(VIEWS["item-library"].base, "/dashboard/items/library");
  assert.equal(VIEWS.categories.base, "/dashboard/items/categories");
  assert.equal(VIEWS.modifiers.base, "/dashboard/items/modifiers");
  assert.equal(VIEWS["online-ordering"].base, "/dashboard/store-setup/review");
});

test("parseDashboardRoute parses various modes and ids", () => {
  assert.deepEqual(parseDashboardRoute("/dashboard"), {
    view: "home",
    mode: "list",
    id: null,
  });
  assert.deepEqual(parseDashboardRoute("/dashboard/"), {
    view: "home",
    mode: "list",
    id: null,
  });
  assert.deepEqual(parseDashboardRoute("/dashboard/items/library"), {
    view: "item-library",
    mode: "list",
    id: null,
  });
  assert.deepEqual(parseDashboardRoute("/dashboard/items/library/"), {
    view: "item-library",
    mode: "list",
    id: null,
  });
  assert.deepEqual(parseDashboardRoute("/dashboard/items/library/new"), {
    view: "item-library",
    mode: "new",
    id: null,
  });
  assert.deepEqual(parseDashboardRoute("/dashboard/items/library/item-123"), {
    view: "item-library",
    mode: "edit",
    id: "item-123",
  });
  assert.deepEqual(parseDashboardRoute("/dashboard/items/categories/new"), {
    view: "categories",
    mode: "new",
    id: null,
  });
  assert.deepEqual(parseDashboardRoute("/dashboard/items/categories/cat-123"), {
    view: "categories",
    mode: "edit",
    id: "cat-123",
  });
  assert.deepEqual(parseDashboardRoute("/dashboard/items/modifiers/new"), {
    view: "modifiers",
    mode: "new",
    id: null,
  });
  assert.deepEqual(parseDashboardRoute("/dashboard/items/modifiers/mod-123"), {
    view: "modifiers",
    mode: "edit",
    id: "mod-123",
  });
  assert.deepEqual(parseDashboardRoute("/dashboard/store-setup/review"), {
    view: "online-ordering",
    mode: "list",
    id: null,
  });
  assert.deepEqual(parseDashboardRoute("/dashboard/unknown"), {
    view: null,
    mode: "list",
    id: null,
  });
  assert.deepEqual(parseDashboardRoute(""), {
    view: null,
    mode: "list",
    id: null,
  });
  assert.deepEqual(parseDashboardRoute(null), {
    view: null,
    mode: "list",
    id: null,
  });
});


