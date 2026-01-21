import { test, expect } from '@playwright/test';

/**
 * Tests E2E pour la page d'accueil
 */
test.describe('Page Accueil', () => {
    test('affiche la page d\'accueil', async ({ page }) => {
        await page.goto('/');

        // Vérifie que la page se charge
        await expect(page.locator('nav')).toBeVisible();
    });

    test('affiche la navbar', async ({ page }) => {
        await page.goto('/');

        // Vérifie que la navbar est visible
        await expect(page.locator('nav')).toBeVisible();

        // Vérifie que le texte "Nuxt Messenger" est présent dans la navbar
        await expect(page.locator('nav').getByText('Nuxt Messenger')).toBeVisible();
    });

    test('les liens de navigation fonctionnent', async ({ page }) => {
        await page.goto('/');

        // Clique sur le lien Réception dans la navbar
        await page.locator('nav').getByRole('link', { name: /réception/i }).click();

        // Vérifie qu'on est sur la page réception
        await expect(page).toHaveURL(/reception/);
    });
});

/**
 * Tests E2E pour la page Réception
 */
test.describe('Page Réception', () => {
    test('affiche le formulaire de profil', async ({ page }) => {
        await page.goto('/reception');

        // Vérifie que le titre "Mon profil" est présent
        await expect(page.getByRole('heading', { name: 'Mon profil' })).toBeVisible();

        // Vérifie qu'il y a un champ input
        await expect(page.locator('input').first()).toBeVisible();
    });

    test('peut entrer un pseudo', async ({ page }) => {
        await page.goto('/reception');

        // Trouve le champ pseudo
        const pseudoInput = page.locator('input').first();

        // Entre un pseudo
        await pseudoInput.fill('TestUser');

        // Vérifie que la valeur est entrée
        await expect(pseudoInput).toHaveValue('TestUser');
    });

    test('affiche les salons disponibles', async ({ page }) => {
        await page.goto('/reception');

        // Vérifie qu'il y a une section avec des liens vers les salons
        // Attend un peu pour que les rooms se chargent
        await page.waitForTimeout(2000);

        // Vérifie qu'il y a au moins un lien ou une indication de salons
        const hasRoomLinks = await page.locator('a[href*="/room/"]').count();
        const hasRoomText = await page.getByText(/salon|room/i).count();

        expect(hasRoomLinks > 0 || hasRoomText > 0).toBe(true);
    });

    test('peut naviguer vers un salon de chat', async ({ page }) => {
        await page.goto('/reception');

        // Entre un pseudo d'abord
        const pseudoInput = page.locator('input').first();
        await pseudoInput.fill('TestUser');

        // Attend que les rooms se chargent
        await page.waitForTimeout(2000);

        // Cherche un lien vers un salon
        const roomLink = page.locator('a[href*="/room/"]').first();

        // Si un lien existe, clique dessus
        if (await roomLink.isVisible().catch(() => false)) {
            await roomLink.click();

            // Vérifie qu'on est dans un salon
            await expect(page).toHaveURL(/room/);
        }
    });
});

/**
 * Tests E2E pour la page Chat (Room)
 */
test.describe('Page Chat', () => {
    test('peut accéder à un salon via l\'URL', async ({ page }) => {
        // Va directement sur un salon
        await page.goto('/room/general');

        // Attendre le chargement
        await page.waitForLoadState('networkidle');

        // Vérifie que l'URL contient room
        await expect(page).toHaveURL(/room/);
    });

    test('affiche l\'interface de chat', async ({ page }) => {
        await page.goto('/room/general');

        // Attendre le chargement
        await page.waitForLoadState('networkidle');

        // Vérifie qu'il y a un champ de saisie pour les messages
        const messageInput = page.locator('input, textarea').first();
        await expect(messageInput).toBeVisible({ timeout: 10000 });
    });
});

/**
 * Tests E2E pour la page Galerie
 */
test.describe('Page Galerie', () => {
    test('affiche la page galerie', async ({ page }) => {
        await page.goto('/gallery');

        // Vérifie que la navbar est présente
        await expect(page.locator('nav')).toBeVisible();
    });

    test('peut naviguer vers la galerie depuis la navbar', async ({ page }) => {
        await page.goto('/');

        // Clique sur le lien Galerie dans la navbar
        await page.locator('nav').getByRole('link', { name: /galerie/i }).click();

        // Vérifie l'URL
        await expect(page).toHaveURL(/gallery/);
    });
});

/**
 * Tests de navigation générale
 */
test.describe('Navigation', () => {
    test('la navbar est présente sur toutes les pages', async ({ page }) => {
        const pages = ['/', '/reception', '/gallery'];

        for (const pagePath of pages) {
            await page.goto(pagePath);
            await expect(page.locator('nav')).toBeVisible();
        }
    });

    test('le lien logo ramène à l\'accueil', async ({ page }) => {
        await page.goto('/reception');

        // Clique sur le logo (premier lien de la navbar)
        await page.locator('nav a').first().click();

        // Vérifie qu'on est sur l'accueil
        await expect(page).toHaveURL('/');
    });
});

