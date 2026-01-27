import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:8080", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Click the 'Siguiente' button on the welcome tour popup to proceed to the next step
        frame = context.pages[-1]
        # Click 'Siguiente' button on the welcome tour popup
        elem = frame.locator('xpath=html/body/div[2]/div/div/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Siguiente' button again to proceed to the next step of the welcome tour
        frame = context.pages[-1]
        # Click 'Siguiente' button on the welcome tour popup to proceed to step 3
        elem = frame.locator('xpath=html/body/div[3]/div/div/div/div[2]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Siguiente' button to proceed to the next step of the welcome tour
        frame = context.pages[-1]
        # Click 'Siguiente' button on the welcome tour popup to proceed
        elem = frame.locator('xpath=html/body/div[2]/div/div/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Siguiente' button to proceed to step 3 of the welcome tour
        frame = context.pages[-1]
        # Click 'Siguiente' button on the welcome tour popup to proceed to step 3
        elem = frame.locator('xpath=html/body/div[3]/div/div/div/div[2]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Siguiente' button to proceed to the final step of the welcome tour
        frame = context.pages[-1]
        # Click 'Siguiente' button on the welcome tour popup to proceed to step 4
        elem = frame.locator('xpath=html/body/div[3]/div/div/div/div[2]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Comenzar' button to proceed to login page
        frame = context.pages[-1]
        # Click 'Comenzar' button on the welcome tour popup to proceed to login
        elem = frame.locator('xpath=html/body/div[2]/div/div/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Omitir tour' button to skip the welcome tour and access the main page for login
        frame = context.pages[-1]
        # Click 'Omitir tour' button to skip the welcome tour popup
        elem = frame.locator('xpath=html/body/div[3]/div/div/div/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Iniciar Sesión' button to open the login form
        frame = context.pages[-1]
        # Click 'Iniciar Sesión' button to open login form
        elem = frame.locator('xpath=html/body/div/div[3]/div[2]/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input email and password, then submit login form
        frame = context.pages[-1]
        # Input email in login form
        elem = frame.locator('xpath=html/body/div/div[3]/div[2]/div[2]/div/div[2]/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin@gmail.com')
        

        frame = context.pages[-1]
        # Input password in login form
        elem = frame.locator('xpath=html/body/div/div[3]/div[2]/div[2]/div/div[2]/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('561509')
        

        frame = context.pages[-1]
        # Click 'Iniciar Sesión' button to submit login form
        elem = frame.locator('xpath=html/body/div/div[3]/div[2]/div[2]/div/div[2]/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Skip or proceed through the welcome tutorial popup to access the main dashboard content
        frame = context.pages[-1]
        # Click 'Omitir tour' button to skip the welcome tutorial popup
        elem = frame.locator('xpath=html/body/div[4]/div/div/div/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Saltar tutorial' button to skip the tutorial popup and access the dashboard content
        frame = context.pages[-1]
        # Click 'Saltar tutorial' button to skip the tutorial popup
        elem = frame.locator('xpath=html/body/div[2]/div/div/div/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Evaluaciones' section to navigate to the evaluations page
        frame = context.pages[-1]
        # Click 'Evaluaciones' section to navigate to evaluations page
        elem = frame.locator('xpath=html/body/div/div[3]/main/div[2]/div[2]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Skip the tutorial popup to access the evaluations list
        frame = context.pages[-1]
        # Click 'Saltar tutorial' button to skip the tutorial popup
        elem = frame.locator('xpath=html/body/div[2]/div/div/div/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Evaluaciones').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Administra las evaluaciones de motricidad fina').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Jose Antonio Mercado Santiago').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Promedio: 2.00').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Juego de Pesca').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Domina').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Sobresaliente').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Próximo a alcanzar').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=No alcanza').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Ver Detalles').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    