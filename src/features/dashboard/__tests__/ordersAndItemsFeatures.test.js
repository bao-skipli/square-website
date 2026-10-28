import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  ORDER_STATUSES,
  ORDER_TABS,
  FULFILLMENT_LABELS,
  PAYMENT_METHOD_LABELS,
} from "../orders/orderConstants.js";
import { generateOrderNumber } from "@/firebase/orderService.js";
import { itemToFormState } from "../dashboardViews.js";

describe("Orders & Item Features Test Suite", () => {
  test("generateOrderNumber generates human-friendly formatted tokens", () => {
    const num1 = generateOrderNumber();
    assert.match(num1, /^#\d{4}-\d{2}$/);
    const num2 = generateOrderNumber();
    assert.match(num2, /^#\d{4}-\d{2}$/);
  });

  test("orderConstants defines proper status lifecycle and badges", () => {
    assert.ok(ORDER_STATUSES.new);
    assert.equal(ORDER_STATUSES.new.label, "Đơn mới");
    assert.equal(ORDER_STATUSES.new.nextStatus, "in_progress");

    assert.ok(ORDER_STATUSES.in_progress);
    assert.equal(ORDER_STATUSES.in_progress.nextStatus, "ready");

    assert.ok(ORDER_STATUSES.ready);
    assert.equal(ORDER_STATUSES.ready.nextStatus, "completed");

    assert.ok(ORDER_STATUSES.completed);
    assert.equal(ORDER_STATUSES.completed.nextStatus, null);

    assert.ok(ORDER_STATUSES.cancelled);

    const tabs = ORDER_TABS.map((t) => t.key);
    assert.deepEqual(tabs, ["all", "new", "in_progress", "ready", "completed", "cancelled"]);
    assert.ok(FULFILLMENT_LABELS.pickup);
    assert.ok(PAYMENT_METHOD_LABELS.vietqr);
  });

  test("itemToFormState extracts calories and allergens properly", () => {
    const rawItem = {
      id: "item-cf",
      name: "Cà phê sữa đá",
      price: "$2.50",
      category: "Cà phê",
      status: "Available",
      calories: "180",
      allergens: "Sữa bò",
      description: "Thơm ngon",
    };

    const state = itemToFormState(rawItem);
    assert.equal(state.formName, "Cà phê sữa đá");
    assert.equal(state.formPrice, "2.50");
    assert.equal(state.formCalories, "180");
    assert.equal(state.formAllergens, "Sữa bò");
    assert.equal(state.itemFormInitial.calories, "180");
    assert.equal(state.itemFormInitial.allergens, "Sữa bò");
  });

  test("catalogSettingsService defaults provide robust initial seeds", async () => {
    const {
      DEFAULT_UNITS,
      DEFAULT_OPTIONS,
      DEFAULT_ATTRIBUTES,
      DEFAULT_MENUS,
      DEFAULT_KITCHEN_SETTINGS,
      DEFAULT_CHANNELS,
    } = await import("@/firebase/catalogSettingsService.js");

    assert.ok(DEFAULT_UNITS.length >= 5);
    assert.ok(DEFAULT_OPTIONS.length >= 3);
    assert.ok(DEFAULT_ATTRIBUTES.length >= 3);
    assert.ok(DEFAULT_MENUS.length >= 3);
    assert.ok(DEFAULT_KITCHEN_SETTINGS.stations.length >= 2);
    assert.ok(DEFAULT_CHANNELS.length >= 3);
  });

  test("getViewFromPath routes newly implemented subviews accurately", async () => {
    const { getViewFromPath } = await import("../dashboardViews.js");

    assert.equal(getViewFromPath("/dashboard/items/options"), "item-options");
    assert.equal(getViewFromPath("/dashboard/items/units"), "units");
    assert.equal(getViewFromPath("/dashboard/items/custom-attributes"), "custom-attributes");
    assert.equal(getViewFromPath("/dashboard/items/menus"), "menus");
    assert.equal(getViewFromPath("/dashboard/items/kitchen-settings"), "kitchen-settings");
    assert.equal(getViewFromPath("/dashboard/channels"), "channels");
    assert.equal(getViewFromPath("/dashboard/customers"), "customers");
    assert.equal(getViewFromPath("/dashboard/reports"), "reports");
    assert.equal(getViewFromPath("/dashboard/staff"), "staff");
    assert.equal(getViewFromPath("/dashboard/banking"), "banking");
    assert.equal(getViewFromPath("/dashboard/settings"), "settings");
    assert.equal(getViewFromPath("/dashboard/whats-new"), "whats-new");
    assert.equal(getViewFromPath("/dashboard/add-more"), "add-more");
  });

  test("customerService exports and helpers operate properly", async () => {
    const { exportCustomersToCSV } = await import("@/firebase/customerService.js");
    assert.equal(typeof exportCustomersToCSV, "function");
  });
});

