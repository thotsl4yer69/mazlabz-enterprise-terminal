import re
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        print("Waiting for 5 seconds before navigating...")
        page.wait_for_timeout(5000)
        print("Navigating to http://localhost:3000...")
        # Navigate to the app
        page.goto("http://localhost:3000")
        print("Navigation complete.")

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
        page.wait_for_timeout(1000)
        page.screenshot(path="jules-scratch/verification/debug.png")

        # Wait for form to appear and fill it out
        form_locator = page.locator('.lead-capture-modal form')
        expect(form_locator).to_be_visible()

        form_locator.get_by_placeholder("Chief Technology Officer").fill("Test User")
        form_locator.get_by_placeholder("cto@fortune500.com").fill("test@example.com")
        form_locator.get_by_placeholder("Fortune 500 Corporation").fill("TestCorp")
        form_locator.locator('div.form-group:has-text("Enterprise Project Type *") > select').select_option("ai-automation")
        form_locator.locator('div.form-group:has-text("Investment Budget *") > select').select_option("75k-150k")
        form_locator.locator('div.form-group:has-text("Implementation Timeline *") > select').select_option("90-days")

        # 3. Submit the form
        form_locator.get_by_role("button", name="REQUEST ENTERPRISE CONSULTATION").click()

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
