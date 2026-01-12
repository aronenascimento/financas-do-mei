# AI Rules for Finance Management App

## Tech Stack

- **React 18** - Main UI framework with TypeScript
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for styling
- **shadcn/ui** - Component library built on Radix UI primitives
- **React Router DOM** - Client-side routing
- **TanStack Query (React Query)** - Server state management
- **Zod** - Schema validation and type inference
- **React Hook Form** - Form management with validation
- **date-fns** - Date manipulation library
- **Recharts** - Data visualization charts
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

## Library Usage Rules

### UI Components
- **Always use shadcn/ui components** when available
- **Import from "@/components/ui/[component]"** for shadcn components
- **Never modify shadcn/ui component files** - create new components if you need variations
- **Use Tailwind CSS classes** for custom styling and responsive design
- **Follow the existing component structure** in src/components/

### Forms
- **Use React Hook Form** for all form handling
- **Use Zod schemas** for form validation
- **Import from "@/components/forms/[form-name]"** for form components
- **Use shadcn/ui form components** (Input, Select, Button, etc.)
- **Always include proper TypeScript types** for form data

### Data Management
- **Use TanStack Query** for server state and caching
- **Use the FinanceContext** for local state management
- **Follow the existing context structure** in src/contexts/
- **Use TypeScript interfaces** for all data types
- **Store data in appropriate context methods** (add, update, remove)

### Routing
- **Use React Router DOM** for all navigation
- **Keep routes in src/App.tsx** as the main routing file
- **Use the existing route structure** with pages in src/pages/
- **Import pages from "@/pages/[page-name]"**
- **Use the NavLink component** for navigation links

### Styling
- **Use Tailwind CSS classes exclusively** for styling
- **Follow the existing color system** defined in tailwind.config.ts
- **Use responsive classes** (sm:, md:, lg:) for mobile-first design
- **Use the existing utility classes** from src/index.css
- **Never use inline styles** - use Tailwind classes instead

### Charts and Data Visualization
- **Use Recharts** for all chart components
- **Import chart components from "@/components/charts/"**
- **Follow the existing chart structure** with proper TypeScript typing
- **Use responsive containers** for all charts
- **Include proper tooltips and legends** for accessibility

### Icons
- **Use Lucide React icons exclusively**
- **Import icons directly** from "lucide-react"
- **Use consistent icon sizes** (w-4 h-4 for mobile, w-5 h-5 for desktop)
- **Follow the existing icon usage patterns** in components

### Date Handling
- **Use date-fns for all date operations**
- **Import specific functions** from "date-fns"
- **Use ptBR locale** for Brazilian Portuguese formatting
- **Follow the existing date formatting patterns**

### File Structure
- **Keep components in src/components/**
- **Keep pages in src/pages/**
- **Keep types in src/types/**
- **Keep contexts in src/contexts/**
- **Keep utilities in src/lib/**
- **Use kebab-case for folder names** (all lowercase)
- **Use PascalCase for component filenames**
- **Use camelCase for variable and function names**

### Code Quality
- **Always use TypeScript** with proper type annotations
- **Follow ESLint rules** defined in the project
- **Use existing utility functions** from src/lib/utils.ts
- **Keep components focused and single-purpose**
- **Use React hooks appropriately** (useState, useEffect, useCallback, useMemo)
- **Never use console.log in production code** - use proper logging or debugging tools

### State Management
- **Use FinanceContext for app-wide state**
- **Use local state for component-specific state**
- **Use TanStack Query for server state**
- **Avoid prop drilling** - use context or composition
- **Keep state updates atomic and predictable**

### Testing
- **Write tests for critical functionality**
- **Use React Testing Library** for component tests
- **Test user interactions, not implementation details**
- **Mock external dependencies** properly
- **Follow existing test patterns** if tests are already in place

### Performance
- **Use React.memo for expensive components**
- **Use useCallback and useMemo** for expensive calculations
- **Lazy load components** when appropriate
- **Optimize re-renders** by avoiding unnecessary state updates
- **Use proper key props** in lists and maps

### Accessibility
- **Use semantic HTML elements**
- **Include proper ARIA labels** where needed
- **Ensure keyboard navigation** works
- **Provide sufficient color contrast**
- **Test with screen readers** when possible