import re
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Navigate to the app
        page.goto("http://localhost:5173")

        # Wait for boot sequence to complete by waiting for the input to be visible
        input_locator = page.locator('input.terminal-input')
        expect(input_locator).to_be_visible(timeout=15000)

        # 1. Run 'help' command
        input_locator.fill("help")
        input_locator.press("Enter")

        # Verify 'admin' command is in the help output
        help_output = page.locator('.terminal-body')
        expect(help_output).to_contain_text("admin        - Access collected intelligence")

        # 2. Open lead capture form
        input_locator.fill("quote")
        input_locator.press("Enter")

        # Wait for form to appear and fill it out
        form_locator = page.locator('.lead-capture-modal')
        expect(form_locator).to_be_visible()

        page.get_by_label("Executive Name *").fill("Test User")
        page.get_by_label("Enterprise Email *").fill("test@example.com")
        page.get_by_label("Company Name *").fill("TestCorp")
        page.get_by_label("Enterprise Project Type *").select_option("ai-automation")
        page.get_by_label("Investment Budget *").select_option("75k-150k")
        page.get_by_label("Implementation Timeline *").select_option("90-days")

        # 3. Submit the form
        page.get_by_role("button", name="REQUEST ENTERPRISE CONSULTATION").click()

        # Wait for the success message in the terminal
        expect(help_output).to_contain_text("Enterprise inquiry received from TestCorp")

        # The modal should close automatically, but we can wait for it to be hidden
        expect(form_locator).to_be_hidden(timeout=5000)

        # 4. Run 'admin leads' to see the result
        input_locator.fill("admin leads")
        input_locator.press("Enter")

        # 5. Verify the lead is in the admin output
        expect(help_output).to_contain_text("test@example.com")
        expect(help_output).to_contain_text("TestCorp")
        expect(help_output).to_contain_text("ai-automation")

        # Take screenshot
        page.screenshot(path="jules-scratch/verification/verification.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run_verification(playwright)
