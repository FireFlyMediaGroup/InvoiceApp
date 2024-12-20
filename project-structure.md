# InvoiceApp Project Structure

```
InvoiceApp/
├── .biome.json
├── .eslintrc.json
├── .gitignore
├── .prettierrc.json
├── CHANGELOG.md
├── components.json
├── jest.config.js
├── jest.setup.js
├── next.config.js
├── next.config 2.js
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── prisma-test.js
├── prisma-test.ts
├── README.md
├── repomix-output.txt
├── tailwind.config.ts
├── test-db-connection.js
├── test-db-connection.ts
├── test-env.js
├── test-pg-connection.js
├── test-pg-connection.ts
├── test-powra-api.js
├── test-powra-api.ts
├── test-powra.ts
├── tsconfig.json
├── tsconfig.test.json
├── __tests__/
│   ├── api/
│   │   ├── fpl-missions.test.ts
│   │   ├── users.test.ts
│   │   └── fpl-missions/
│   ├── components/
│   │   └── FPLMissions/
│   ├── integration/
│   │   └── fpl-mission-workflow.test.ts
│   └── security/
│       ├── invoice.test.ts
│       ├── powra.test.ts
│       └── rbac.test.ts
├── app/
│   ├── actions/
│   │   ├── fplMissions.ts
│   │   └── getInvoices.ts
│   ├── api/
│   │   ├── auth/
│   │   ├── email/
│   │   ├── fpl-missions/
│   │   ├── invoice/
│   │   ├── invoices/
│   │   ├── powra/
│   │   ├── test/
│   │   ├── test-db/
│   │   ├── test-db-connection/
│   │   ├── test-email/
│   │   ├── test-login/
│   │   └── users/
│   ├── check-email/
│   │   └── page.tsx
│   ├── components/
│   │   ├── FPLMissions/
│   │   ├── POWRAFormParts/
│   │   ├── ui/
│   │   ├── AdminDashboardCards.tsx
│   │   ├── CreateInvoice.tsx
│   │   ├── CreateUserForm.tsx
│   │   ├── DashboardBlocks.tsx
│   │   ├── DashboardBlocksContainer.tsx
│   │   ├── DashboardBlocksServer.tsx
│   │   ├── DashboardBlocksWrapper.tsx
│   │   ├── DashboardLinks.tsx
│   │   ├── DashboardNavbar.tsx
│   │   ├── DeactivateUserForm.tsx
│   │   ├── EditInvoice.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── FPLMissionsDashboard.tsx
│   │   ├── Graph.tsx
│   │   ├── Hero.tsx
│   │   ├── InvoiceActions.tsx
│   │   ├── InvoiceGraph.tsx
│   │   ├── InvoiceGraphWrapper.tsx
│   │   ├── InvoiceList.tsx
│   │   ├── ModifyUserRoleForm.tsx
│   │   ├── Navbar.tsx
│   │   ├── POWRAForm.tsx
│   │   ├── POWRAList.tsx
│   │   ├── RecentInvoices.tsx
│   │   ├── RecentInvoicesWrapper.tsx
│   │   ├── SubmitButtons.tsx
│   │   └── UserManagement.tsx
│   ├── dashboard/
│   │   ├── fpl-missions/
│   │   ├── invoices/
│   │   ├── powra/
│   │   ├── users/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── fonts/
│   │   ├── GeistMonoVF.woff
│   │   └── GeistVF.woff
│   ├── hooks/
│   │   └── usePOWRAForm.ts
│   ├── lib/
│   │   └── invoice.ts
│   ├── login/
│   │   ├── error.tsx
│   │   └── page.tsx
│   ├── middleware/
│   │   └── rbac.ts
│   ├── onboarding/
│   │   └── page.tsx
│   ├── unauthorized/
│   │   └── page.tsx
│   ├── utils/
│   │   ├── auth.ts
│
