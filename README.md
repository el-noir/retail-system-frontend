# Store Master Frontend

A modern, responsive retail management system frontend built with Next.js 16, React 19, TypeScript, and Tailwind CSS. This application provides an intuitive interface for managing inventory, sales, procurement, and analytics.

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Redux Toolkit (@reduxjs/toolkit)
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Payments**: Stripe (@stripe/react-stripe-js, @stripe/stripe-js)
- **Icons**: Lucide React
- **Theme**: next-themes (Dark/Light mode)
- **Notifications**: Sonner (Toast notifications)
- **Date Utilities**: date-fns

## 📁 Project Structure

```
frontend/
├── src/                          # Source code directory
│   ├── app/                      # Next.js App Router pages
│   │   ├── layout.tsx            # Root layout with providers
│   │   ├── page.tsx              # Landing/home page
│   │   ├── globals.css           # Global styles and Tailwind imports
│   │   ├── favicon.ico           # Favicon
│   │   │
│   │   ├── sign-in/              # Authentication - Sign In
│   │   │   └── page.tsx          # Sign in page
│   │   │
│   │   ├── sign-up/              # Authentication - Sign Up
│   │   │   └── page.tsx          # Sign up page
│   │   │
│   │   ├── verify-otp/           # OTP Verification
│   │   │   └── page.tsx          # OTP verification page
│   │   │
│   │   ├── sales/                # Sales pages (for cashier)
│   │   │   └── page.tsx          # Sales/POS page
│   │   │
│   │   └── dashboard/            # Main dashboard (protected routes)
│   │       ├── page.tsx          # Dashboard home page
│   │       │
│   │       ├── admin/            # Admin-specific pages
│   │       │   ├── page.tsx      # Admin dashboard
│   │       │   └── categories/   # Category management
│   │       │       └── page.tsx  # Categories page
│   │       │
│   │       ├── cashier/          # Cashier-specific pages
│   │       │   └── page.tsx      # Cashier dashboard
│   │       │
│   │       ├── analytics/        # Analytics & reports
│   │       │   └── page.tsx      # Analytics dashboard
│   │       │
│   │       ├── products/         # Product management
│   │       │   └── page.tsx      # Products page
│   │       │
│   │       ├── suppliers/        # Supplier management
│   │       │   └── page.tsx      # Suppliers page
│   │       │
│   │       ├── purchase-orders/  # Purchase order management
│   │       │   └── page.tsx      # Purchase orders page
│   │       │
│   │       └── restock-recommendations/  # Restock alerts
│   │           └── page.tsx      # Restock recommendations page
│   │
│   ├── components/               # React components
│   │   ├── AdminSidebar.tsx      # Admin navigation sidebar
│   │   ├── Sidebar.tsx           # General sidebar component
│   │   ├── Navbar.tsx            # Navigation bar
│   │   ├── ProtectedRoute.tsx    # Route protection HOC
│   │   ├── ErrorBoundary.tsx     # Error boundary component
│   │   ├── Toast.tsx             # Toast notification component
│   │   ├── DataTable.tsx         # Reusable data table
│   │   ├── ProductForm.tsx       # Product form component
│   │   ├── ProductModal.tsx      # Product modal dialog
│   │   ├── ProductFilters.tsx    # Product filtering component
│   │   ├── SearchAndFilter.tsx   # Search and filter component
│   │   ├── EnhancedForm.tsx      # Enhanced form component
│   │   ├── ProcurementOverview.tsx  # Procurement overview
│   │   │
│   │   └── ui/                   # Shadcn/Radix UI components
│   │       ├── badge.tsx         # Badge component
│   │       ├── button.tsx        # Button component
│   │       ├── card.tsx          # Card component
│   │       ├── checkbox.tsx      # Checkbox component
│   │       ├── dialog.tsx        # Dialog/Modal component
│   │       ├── dropdown-menu.tsx # Dropdown menu component
│   │       ├── form.tsx          # Form component wrapper
│   │       ├── input.tsx         # Input component
│   │       ├── label.tsx         # Label component
│   │       ├── select.tsx        # Select dropdown component
│   │       ├── skeleton.tsx      # Loading skeleton component
│   │       ├── sonner.tsx        # Sonner toast wrapper
│   │       ├── table.tsx         # Table component
│   │       ├── textarea.tsx      # Textarea component
│   │       └── responsive-table.tsx  # Responsive table wrapper
│   │
│   └── lib/                      # Utility libraries
│       ├── utils.ts              # Utility functions (cn, etc.)
│       │
│       ├── api/                  # API client layer
│       │   ├── client.ts         # Axios client configuration
│       │   ├── auth.ts           # Authentication API calls
│       │   ├── products.ts       # Products API calls
│       │   ├── categories.ts     # Categories API calls
│       │   ├── sales.ts          # Sales API calls
│       │   ├── inventory.ts      # Inventory API calls
│       │   ├── suppliers.ts      # Suppliers API calls
│       │   ├── purchase-orders.ts # Purchase orders API calls
│       │   ├── payments.ts       # Payments API calls (Stripe)
│       │   ├── analytics.ts      # Analytics API calls
│       │   └── stock.ts          # Stock management API calls
│       │
│       ├── store/                # Redux store configuration
│       │   ├── index.ts          # Store configuration & exports
│       │   ├── hooks.ts          # Typed Redux hooks (useAppDispatch, useAppSelector)
│       │   ├── ReduxProvider.tsx # Redux Provider wrapper component
│       │   │
│       │   └── slices/           # Redux slices
│       │       ├── productsSlice.ts    # Products state management
│       │       ├── salesSlice.ts       # Sales state management
│       │       ├── suppliersSlice.ts   # Suppliers state management
│       │       ├── purchasesSlice.ts   # Purchase orders state
│       │       └── analyticsSlice.ts   # Analytics state
│       │
│       ├── hooks/                # Custom React hooks
│       │   ├── index.ts          # Hook exports
│       │   ├── useDebounce.ts    # Debounce hook
│       │   ├── useDebouncedCallback.ts  # Debounced callback hook
│       │   └── useThrottle.ts    # Throttle hook
│       │
│       └── validations/          # Zod validation schemas
│           ├── signInSchema.ts   # Sign in form validation
│           └── signUpSchema.ts   # Sign up form validation
│
├── public/                       # Static assets
│   └── manifest.json             # PWA manifest
│
├── Configuration Files
│   ├── package.json              # Dependencies and scripts
│   ├── tsconfig.json             # TypeScript configuration
│   ├── next.config.ts            # Next.js configuration
│   ├── next-env.d.ts             # Next.js TypeScript declarations
│   ├── tailwind.config.js        # Tailwind CSS configuration (implied)
│   ├── postcss.config.mjs        # PostCSS configuration
│   ├── components.json           # Shadcn UI configuration
│   ├── eslint.config.mjs         # ESLint configuration
│   ├── FRONTEND_UX_ENHANCEMENTS.md  # UX enhancement documentation
│   └── README.md                 # This file
```

## 🎨 Design System

### Color Scheme
- Supports light and dark themes via `next-themes`
- CSS variables for consistent theming
- Tailwind CSS utility classes

### UI Components
- Built on Radix UI primitives for accessibility
- Customized with Tailwind CSS
- Consistent design patterns across all pages
- Responsive design for mobile, tablet, and desktop

### Typography
- System font stack for optimal performance
- Consistent heading hierarchy
- Readable body text with proper line height

## 🔑 Key Features

### 1. Authentication & Authorization
- User registration with email verification
- OTP-based email verification
- JWT-based authentication
- Role-based access control (RBAC)
- Protected routes with redirect
- Persistent authentication state

### 2. Dashboard
- Role-specific dashboards (Admin, Cashier, Manager, Procurement)
- Real-time statistics and KPIs
- Quick actions and shortcuts
- Responsive sidebar navigation

### 3. Product Management
- CRUD operations for products
- Product search and filtering
- Category-based organization
- Image upload support
- Stock level indicators
- Bulk operations

### 4. Inventory Management
- Real-time stock tracking
- Stock adjustment interface
- Low stock alerts
- Restock recommendations
- Stock movement history
- Inventory valuation reports

### 5. Sales & Point of Sale (POS)
- Fast and intuitive POS interface
- Product search and quick add
- Shopping cart management
- Multiple payment methods (Cash, Card, Stripe)
- Receipt generation
- Sales history

### 6. Supplier Management
- Supplier CRUD operations
- Contact information management
- Supplier product catalog
- Performance tracking

### 7. Procurement
- Purchase order creation and management
- Supplier selection
- Order status tracking
- Receiving interface
- Expected vs. actual delivery tracking

### 8. Analytics & Reporting
- Sales analytics with charts
- Revenue tracking
- Product performance metrics
- Inventory analytics
- Custom date range selection
- Export capabilities

### 9. Payment Processing
- Stripe integration
- Secure payment handling
- Payment confirmation
- Transaction history

### 10. Responsive Design
- Mobile-first approach
- Tablet optimization
- Desktop layouts
- Touch-friendly interfaces
- Responsive tables

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Backend API running (see backend README)

### Installation

1. **Clone the repository**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the frontend directory:
   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3000
   
   # Stripe Configuration
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   
   # Application Configuration
   NEXT_PUBLIC_APP_NAME="Store Master"
   NEXT_PUBLIC_APP_URL=http://localhost:3001
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the application**
   
   Navigate to [http://localhost:3001](http://localhost:3001)

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (hot reload) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 🎯 Application Routes

### Public Routes
- `/` - Landing page
- `/sign-in` - User sign in
- `/sign-up` - User registration
- `/verify-otp` - OTP verification

### Protected Routes (Requires Authentication)
- `/dashboard` - Main dashboard (role-based)
- `/dashboard/admin` - Admin dashboard
- `/dashboard/admin/categories` - Category management
- `/dashboard/cashier` - Cashier dashboard
- `/dashboard/analytics` - Analytics and reports
- `/dashboard/products` - Product management
- `/dashboard/suppliers` - Supplier management
- `/dashboard/purchase-orders` - Purchase order management
- `/dashboard/restock-recommendations` - Restock alerts
- `/sales` - Point of Sale (POS) interface

## 🔐 User Roles & Permissions

### Admin
- Full system access
- User management
- Category management
- Product management
- Sales management
- Procurement management
- Analytics access

### Manager
- Product management
- Sales management
- Procurement management
- Analytics access
- Inventory adjustments

### Cashier
- POS access
- View products
- Create sales
- Limited dashboard access

### Procurement
- Supplier management
- Purchase order management
- Receive orders
- View inventory

## 🎨 Styling

### Tailwind CSS
The project uses Tailwind CSS 4 for styling:
- Utility-first approach
- Custom design tokens
- Responsive breakpoints
- Dark mode support

### CSS Variables
Theme variables are defined in [globals.css](src/app/globals.css):
- `--background`, `--foreground`
- `--primary`, `--secondary`
- `--accent`, `--muted`
- `--destructive`, `--success`
- Border radius, shadows, and more

## 📦 State Management

### Redux Toolkit
The application uses Redux Toolkit for global state management:

#### Products Slice
- Product list
- Selected product
- Loading states
- Filters

#### Sales Slice
- Cart items
- Active sale
- Sales history

#### Suppliers Slice
- Supplier list
- Selected supplier

#### Purchases Slice
- Purchase orders
- PO status

#### Analytics Slice
- Dashboard metrics
- Chart data

### Usage Example
```typescript
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { fetchProducts } from '@/lib/store/slices/productsSlice';

const products = useAppSelector(state => state.products.items);
const dispatch = useAppDispatch();

useEffect(() => {
  dispatch(fetchProducts());
}, [dispatch]);
```

## 🔌 API Integration

All API calls are centralized in the `src/lib/api/` directory:

```typescript
// Example: Fetching products
import { getProducts } from '@/lib/api/products';

const products = await getProducts({ page: 1, limit: 10 });
```

### API Client Configuration
The Axios client is configured in [client.ts](src/lib/api/client.ts):
- Base URL from environment variables
- JWT token interceptor
- Error handling
- Request/response interceptors

## 🎣 Custom Hooks

### useDebounce
Debounce a value (useful for search inputs):
```typescript
const debouncedSearch = useDebounce(searchTerm, 500);
```

### useDebouncedCallback
Debounce a callback function:
```typescript
const debouncedFn = useDebouncedCallback(handleSearch, 500);
```

### useThrottle
Throttle a value:
```typescript
const throttledValue = useThrottle(scrollY, 100);
```

## 🧪 Form Validation

Forms use React Hook Form with Zod validation:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema } from '@/lib/validations/signInSchema';

const form = useForm({
  resolver: zodResolver(signInSchema),
  defaultValues: { email: '', password: '' }
});
```

## 🌐 Environment Variables

Required environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3000` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key | `pk_test_...` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `Store Master` |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | `http://localhost:3001` |

## 🎨 Theme Customization

The application supports light and dark themes. Theme switching is handled by `next-themes`.

### Adding a New Theme Color
1. Add CSS variable to [globals.css](src/app/globals.css)
2. Add Tailwind utility class
3. Use in components: `className="bg-your-color"`

## 📱 Responsive Design

### Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Mobile-First Approach
All components are designed mobile-first and scale up:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Content */}
</div>
```

## 🔔 Notifications

Toast notifications use Sonner:
```typescript
import { toast } from 'sonner';

toast.success('Product created successfully');
toast.error('Failed to create product');
toast.info('Processing...');
```

## 🧩 Component Library

The project uses Shadcn UI components built on Radix UI:
- Fully accessible
- Customizable
- Type-safe
- Composable

### Adding New Shadcn Components
```bash
npx shadcn-ui@latest add [component-name]
```

## 🚀 Performance Optimization

- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Dynamic imports for heavy components
- **Debouncing**: Search and filter operations
- **Memoization**: React.memo and useMemo for expensive computations

## 🔒 Security Best Practices

- JWT tokens stored in httpOnly cookies (handled by backend)
- No sensitive data in localStorage
- Input validation on client and server
- XSS prevention with proper escaping
- CSRF protection

## 🐛 Error Handling

- Error boundaries for component errors
- Global error handling in API client
- User-friendly error messages
- Logging for debugging

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript types properly
3. Write meaningful component names
4. Add comments for complex logic
5. Test on multiple screen sizes
6. Follow ESLint rules

## 📄 License

UNLICENSED - Private project

## 👨‍💻 Support

For support or questions, refer to the documentation or contact the development team.

## 🎯 Future Enhancements

See [FRONTEND_UX_ENHANCEMENTS.md](FRONTEND_UX_ENHANCEMENTS.md) for planned improvements.

---

**Built with ❤️ using Next.js, React, TypeScript, and Tailwind CSS**

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
