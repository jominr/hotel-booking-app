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

test('should show hotel detail', async ({ page }) => {
  await page.goto(`${UI_URL}/`);

  await page.getByPlaceholder("Where are you going?").fill("melbourne");
  await page.getByRole("button", {name: "Search"}).click();

  await page.getByText("xiao xiang").click();
  await expect(page).toHaveURL(/detail/);
  await expect(page.getByRole("button", {name: "Book now"})).toBeVisible();
});


test('should book hotel', async ({ page }) => {
  await page.goto(`${UI_URL}/`);

  await page.getByPlaceholder("Where are you going?").fill("melbourne");
  
  const date = new Date();

  date.setDate(date.getDate() + 3);
  const formattedDate = date.toISOString().split("T")[0];
  await page.getByPlaceholder("Check-out Date").fill(formattedDate);

  await page.getByRole("button", {name: "Search"}).click();

  await page.getByText("xiao xiang").click();
  
  await page.getByRole("button", {name: "Book now"}).click();

  await expect(page.getByText("Total Cost: $1026.00")).toBeVisible();

  const stripeFrame = page.frameLocator("iframe").first();
  await stripeFrame
    .locator('[placeholder="Card number"]')
    .fill("4242424242424242");
  await stripeFrame.locator('[placeholder="MM / YY"]').fill("04/30");
  await stripeFrame.locator('[placeholder="CVC"]').fill("242");
  await stripeFrame.locator('[placeholder="ZIP"]').fill("24225");

  await page.getByRole("button", {name: "Confirm Booking"}).click();
  await page.waitForTimeout(5000); // 这里太慢了。
  await expect(page.getByText("Booking Saved!")).toBeVisible();
});