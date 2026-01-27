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
        # -> Find and click navigation element to go to /children page
        await page.mouse.wheel(0, 300)
        

        # -> Click 'Omitir tour' button to close the welcome tour popup
        frame = context.pages[-1]
        # Click 'Omitir tour' button to close the welcome tour popup
        elem = frame.locator('xpath=html/body/div[2]/div/div/div/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Iniciar Sesión' button to go to login page
        frame = context.pages[-1]
        # Click 'Iniciar Sesión' button to go to login page
        elem = frame.locator('xpath=html/body/div/div[3]/div[2]/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input admin email and password, then click 'Iniciar Sesión' button to log in.
        frame = context.pages[-1]
        # Input admin email
        elem = frame.locator('xpath=html/body/div/div[3]/div[2]/div[2]/div/div[2]/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin@gmail.com')
        

        frame = context.pages[-1]
        # Input admin password
        elem = frame.locator('xpath=html/body/div/div[3]/div[2]/div[2]/div/div[2]/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('561509')
        

        frame = context.pages[-1]
        # Click 'Iniciar Sesión' button to log in
        elem = frame.locator('xpath=html/body/div/div[3]/div[2]/div[2]/div/div[2]/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Omitir tour' button to close the tutorial popup and access the dashboard fully.
        frame = context.pages[-1]
        # Click 'Omitir tour' button to close the tutorial popup
        elem = frame.locator('xpath=html/body/div[4]/div/div/div/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Saltar tutor' button to skip the tutorial and access the dashboard.
        frame = context.pages[-1]
        # Click 'Saltar tutor' button to skip the tutorial popup
        elem = frame.locator('xpath=html/body/div[2]/div/div/div/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Aprendientes' section to navigate to children management page.
        frame = context.pages[-1]
        # Click on 'Aprendientes' section to go to children management page
        elem = frame.locator('xpath=html/body/div/div[3]/main/div[2]/div/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Scroll to 'Aprendientes' section and retry clicking it to navigate to children management page.
        frame = context.pages[-1]
        # Retry clicking 'Aprendientes' section to navigate to children management page
        elem = frame.locator('xpath=html/body/div/div[3]/main/div[2]/div/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Saltar tutorial' button to skip the tutorial popup.
        frame = context.pages[-1]
        # Click 'Saltar tutorial' button to skip the tutorial popup
        elem = frame.locator('xpath=html/body/div[2]/div/div/div/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Agregar' button to start creating a new child profile.
        frame = context.pages[-1]
        # Click 'Agregar' button to create a new child profile
        elem = frame.locator('xpath=html/body/div/div[3]/header/div/div[2]/button[4]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fill in the new child profile details: name, birthdate, gender, grade, school, then save.
        frame = context.pages[-1]
        # Input child's full name
        elem = frame.locator('xpath=html/body/div[3]/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Juan Perez')
        

        frame = context.pages[-1]
        # Input child's birthdate
        elem = frame.locator('xpath=html/body/div[3]/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('2015-05-15')
        

        frame = context.pages[-1]
        # Open gender dropdown
        elem = frame.locator('xpath=html/body/div[3]/form/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Masculino' option to select gender, then fill in school name and save the profile.
        frame = context.pages[-1]
        # Select 'Masculino' gender option
        elem = frame.locator('xpath=html/body/div[4]/div/div/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Select '1ro' grade from the grade dropdown, input 'Escuela Primaria Central' in the school field, and then click 'Guardar' to save the new child profile.
        frame = context.pages[-1]
        # Open grade dropdown
        elem = frame.locator('xpath=html/body/div[3]/form/div[4]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Try clicking the 'Agregar' button again to reopen the form or report the issue with grade dropdown not interactable.
        frame = context.pages[-1]
        # Click 'Agregar' button to reopen the new child profile form or refresh form state
        elem = frame.locator('xpath=html/body/div/div[3]/header/div/div[2]/button[4]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Gestión de Aprendientes').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Administra los registros de los aprendientes evaluados').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=No hay aprendientes registrados.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Haga clic en "Agregar Aprendiente" para comenzar.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Agregar Aprendiente').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Complete los datos del aprendiente').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Nombre Completo *').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Fecha de Nacimiento *').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Género').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Seleccionar').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Masculino').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Femenino').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Grado').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Seleccionar grado').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=1ro').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=2do').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=3ro').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Escuela').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Cancelar').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Guardar').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Close').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    