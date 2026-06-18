# Ownit UI Design System

This document outlines the standard UI conventions, color palettes, and component styling rules for the Ownit platform frontend. All agents and developers must adhere to these guidelines when building or modifying React components to maintain a cohesive aesthetic.

## 1. Color Palette

The platform uses a warm, structured aesthetic driven by Mantine's theme system (`ui/src/main.tsx`).

### Primary Color
- **`orange`** is the primary color for the application.
- Used for primary buttons, active states, active icons, and primary accents.
- Example: `color="orange"`, `bg="orange.6"`.

### Backgrounds
- **App Background (`bgLight`)**: `#FFF6E9`. A warm, off-white/beige used as the main canvas for the application.
- **Card Background (`white`)**: `#FFFFFF`. Used for elements that sit on top of the `bgLight` canvas (like Cards, Papers, headers) to create depth.

### Borders
- **Standard Border (`borderLight`)**: `#E8DFD6`.
- Used to separate elements cleanly without harsh lines.
- Example: `style={{ borderBottom: '1px solid var(--mantine-color-borderLight-0)' }}`.

## 2. Component Styling

### Cards and Panels
- Elements floating above the background (like `Card` or `Paper`) should typically have:
  - `bg="white"` (default for Card/Paper).
  - `withBorder` (uses the theme's default border or `borderLight`).
  - `radius="md"` or `radius="lg"`.
  - `p="lg"` (padding large) for standard content sections.

### Avatars & Icons
- When an icon needs emphasis (like the header logo or an AI avatar), wrap it in a centered container with the primary color and a large radius.
- Example: `bg="orange.6"`, `style={{ borderRadius: 'var(--mantine-radius-lg)' }}`.
- Avoid using `blue` or other unconfigured primary colors unless specifically denoting an alternative state (e.g., `green` for success/authenticated).

### Typography
- **Titles**: Use the `<Title>` component.
  - Page Headers: `order={1}`.
  - Section Headers: `order={2}` or `size="h3"`.
- **Text**: Use `<Text>`.
  - Secondary descriptions, hints, or metadata should use `c="dimmed"`.
  - Emphasized text can use `fw={600}`.

## 3. General Layout
- **App Shell**: Uses a column flex layout (`<Flex direction="column" mih="100vh">`) with a top `Navbar`.
- The main content area expands to fill available space (`flex={1}`) and uses `bg="bgLight.0"`.

## Summary
When building a new component:
1. **Never use `blue`** (Mantine's default primary) as your primary action color. Use `orange`.
2. Ensure components placed on the root layout have a `white` background to contrast with `bgLight`.
3. Use `c="dimmed"` for secondary text to establish a clear typographic hierarchy.
