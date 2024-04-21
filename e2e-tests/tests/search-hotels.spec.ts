import { test, expect } from '@playwright/test';

const UI_URL = "http://localhost:5173";

test.beforeEach(async ({ page })=>{
  await page.goto(UI_URL);

  await page.getByRole("link", {name: "Sign In"}).click();

  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();

  await page.locator("[name=email]").fill("2@22.com");
  await page.locator("[name=password]").fill("password123");

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByText("Sign in Successful!")).toBeVisible();
});

test('should show hotel search results', async ({ page }) => {
  await page.goto(`${UI_URL}/`);

  await page.getByPlaceholder("Where are you going?").fill("melbourne");
  await page.getByRole("button", {name: "Search"}).click();
  await expect(page.getByText("1 Hotels found in melbourne")).toBeVisible();
  await expect(page.getByText("xiao xiang")).toBeVisible();
});
