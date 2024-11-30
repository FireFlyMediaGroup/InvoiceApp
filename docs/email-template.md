# Email Template Documentation

## Overview

This document describes the email template used for user authentication in our application. The template is designed to be responsive, accessible, and compatible with a wide range of email clients.

## Template Location

The email template is located in the `app/utils/auth.ts` file, within the `sendVerificationRequest` function of the `NodemailerProvider` configuration.

## Features

1. **Responsive Design**: The email uses a mobile-friendly layout with a max-width of 600px.
2. **Accessibility**: Includes semantic HTML and ARIA attributes for better screen reader support.
3. **Inline CSS**: Critical styles are inlined for consistent rendering across email clients.
4. **Branding**: Uses customizable brand colors.
5. **Clear Call-to-Action**: Includes a prominent "Sign In" button.
6. **Table-based Layout**: Ensures compatibility with various email clients.
7. **Email Client Compatibility**: Includes conditional comments for Outlook and other Microsoft Office email clients.
8. **Typography**: Uses Segoe UI font with appropriate fallbacks.
9. **Preheader Text**: The first line of text serves as a preheader in most email clients.

## Customization

The following variables can be easily modified to customize the email appearance:

- `brandColor`
- `backgroundColor`
- `textColor`
- `mainBackgroundColor`
- `buttonBackgroundColor`
- `buttonBorderColor`
- `buttonTextColor`

## HTML Structure

The email template uses the following structure:

1. DOCTYPE and language declaration
2. Head section with meta tags and styles
3. Body with table-based layout
4. Main content area with heading, text, and call-to-action button

## Best Practices

- The template uses tables for layout, which is more reliable in email clients.
- Styles are inlined to ensure consistent rendering.
- The design is kept simple and focused on the main action (signing in).
- Alt text is used for images (when added) for accessibility.

## Future Improvements

- Add company logo to enhance branding.
- Implement A/B testing to optimize email open rates and click-through rates.
- Create variations of the template for different types of notifications or user actions.

## Maintenance

When updating the email template:

1. Test the email in various clients and devices.
2. Ensure any new styles are inlined.
3. Update this documentation if significant changes are made.

## Related Files

- `app/utils/auth.ts`: Contains the email sending logic and template.
- `app/pages/verify.tsx`: The page users see after requesting a sign-in link.
- `app/pages/login.tsx`: The page where users initiate the sign-in process.
