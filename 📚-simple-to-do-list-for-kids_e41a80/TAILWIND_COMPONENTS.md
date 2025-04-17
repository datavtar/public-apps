
# Tailwind Component Examples

This file provides examples of common UI components using the Tailwind utility classes.

## Button Variants
```jsx
<button className="btn btn-primary">Primary Button</button>
<button className="btn btn-secondary">Secondary Button</button>
<button className="btn bg-gray-500 text-white hover:bg-gray-600">Gray Button</button>
<button className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">Outline Button</button>
```

## Responsive Buttons
```jsx
<button className="btn-responsive bg-primary-500 text-white">Responsive Button</button>
<button className="btn-sm md:btn-lg bg-secondary-500 text-white">Size-Changing Button</button>
```

## Card Component
```jsx
<div className="card">
  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Card Title</h3>
  <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">Card content goes here...</p>
  <div className="mt-4">
    <button className="btn btn-primary">Action</button>
  </div>
</div>
```

## Responsive Card
```jsx
<div className="card-responsive">
  <h3 className="text-base sm:text-lg md:text-xl font-medium">Responsive Card</h3>
  <p className="mt-2 text-xs sm:text-sm md:text-base">This card adjusts its padding and text size based on screen width.</p>
</div>
```

## Form Elements
```jsx
<div className="space-y-4">
  <div className="form-group">
    <label className="form-label" htmlFor="email">Email</label>
    <input id="email" type="email" className="input" />
    <p className="form-error">Please enter a valid email</p>
  </div>
  
  <div className="form-group">
    <label className="form-label" htmlFor="password">Password</label>
    <input id="password" type="password" className="input" />
  </div>
</div>
```

## Tables
```jsx
<div className="table-container">
  <table className="table">
    <thead>
      <tr>
        <th className="table-header">Name</th>
        <th className="table-header">Email</th>
        <th className="table-header">Status</th>
        <th className="table-header">Actions</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
      <tr>
        <td className="table-cell">John Doe</td>
        <td className="table-cell">john@example.com</td>
        <td className="table-cell">
          <span className="badge badge-success">Active</span>
        </td>
        <td className="table-cell">
          <button className="btn btn-sm btn-primary">Edit</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

## Badge Examples
```jsx
<span className="badge badge-success">Success</span>
<span className="badge badge-error">Error</span>
<span className="badge badge-warning">Warning</span>
<span className="badge badge-info">Info</span>
```

## Alert Examples
```jsx
<div className="alert alert-success">
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
  <p>Success! Your changes have been saved.</p>
</div>

<div className="alert alert-error">
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
  <p>Error! Please check your input and try again.</p>
</div>
```

## Container Layouts
```jsx
<div className="container-fluid">
  <h2 className="text-xl font-semibold">Container Title</h2>
  <p className="mt-2">Container content goes here...</p>
</div>

<div className="container-narrow">
  <h2 className="text-xl font-semibold">Narrow Container Title</h2>
  <p className="mt-2">Narrow container content goes here...</p>
</div>

<div className="container-wide">
  <h2 className="text-xl font-semibold">Wide Container Title</h2>
  <p className="mt-2">Wide container content goes here...</p>
</div>
```

## Skeleton Loading Examples
```jsx
<div className="space-y-3">
  <div className="skeleton-text w-1/2"></div>
  <div className="skeleton-text w-full"></div>
  <div className="skeleton-text w-2/3"></div>
  <div className="flex items-center mt-4 gap-2">
    <div className="skeleton-circle w-10 h-10"></div>
    <div className="space-y-2">
      <div className="skeleton-text w-24 h-3"></div>
      <div className="skeleton-text w-32 h-3"></div>
    </div>
  </div>
</div>
```

## Stat Cards
```jsx
<div className="stat-card">
  <div className="stat-title">Total Users</div>
  <div className="stat-value">12,345</div>
  <div className="stat-desc">↗︎ 14% from last month</div>
</div>
```

## Animation Examples
```jsx
<div className="fade-in">
  This content will fade in
</div>

<div className="slide-in">
  This content will slide in from below
</div>

<button className="btn btn-primary transition-transform hover:scale-105">
  Grow on Hover
</button>
```

## Modal Example
```jsx
<div className="modal-backdrop">
  <div className="modal-content">
    <div className="modal-header">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Modal Title</h3>
      <button className="text-gray-400 hover:text-gray-500">×</button>
    </div>
    <div className="mt-2">
      <p className="text-gray-500 dark:text-slate-400">Modal content goes here...</p>
    </div>
    <div className="modal-footer">
      <button className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</button>
      <button className="btn btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

## Modal Accessibility
```jsx
<div 
  className="modal-backdrop" 
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <div className="modal-content">
    <div className="modal-header">
      <h3 id="modal-title" className="text-lg font-medium">Accessible Modal Title</h3>
      <button aria-label="Close modal">×</button>
    </div>
    {/* Modal content */}
  </div>
</div>
```

## Modal in React Components
```jsx
// Open modal
const openModal = () => {
  document.body.classList.add('modal-open'); // Prevent background scrolling
  setIsModalOpen(true);
};

// Close modal
const closeModal = () => {
  document.body.classList.remove('modal-open');
  setIsModalOpen(false);
};

// In your JSX
{isModalOpen && (
  <div className="modal-backdrop" onClick={closeModal}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      {/* Modal content */}
    </div>
  </div>
)}
```

## Flex Layout Helpers
```jsx
<div className="flex-center">
  <p>Centered content</p>
</div>

<div className="flex-between">
  <span>Left item</span>
  <span>Right item</span>
</div>

<div className="flex-start">
  <span>Left aligned items</span>
</div>

<div className="flex-end">
  <span>Right aligned items</span>
</div>
```

## Responsive Grid Layout
```jsx
<div className="grid-responsive">
  <div className="card">Card 1</div>
  <div className="card">Card 2</div>
  <div className="card">Card 3</div>
  <div className="card">Card 4</div>
</div>
```

## Z-Index System
Use our z-index variables for consistent layering:

                        ```css
/* In your CSS */
.custom-dropdown {
  z-index: var(--z-dropdown);
}

.custom-modal {
  z-index: var(--z-modal);
}

.custom-tooltip {
  z-index: var(--z-tooltip);
}
```

## Stack Layout Utilities
```jsx
{/* Vertical spacing between children */}
<div className="stack-y">
  <p>First paragraph</p>
  <p>Second paragraph with consistent spacing</p>
  <p>Third paragraph</p>
</div>

{/* Horizontal spacing between children */}
<div className="flex stack-x">
  <button className="btn">First</button>
  <button className="btn">Second</button>
  <button className="btn">Third</button>
</div>
```

## Aspect Ratio Examples
```jsx
<div className="aspect-w-16 aspect-h-9">
  <img src="https://example.com/image.jpg" alt="Example" className="object-cover" />
</div>

<div className="aspect-w-1 aspect-h-1">
  <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800">
    Square Content
  </div>
</div>
```

## Theme Transition Examples
```jsx
<div className="bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 p-4 rounded-lg shadow theme-transition">
  <h2 className="text-xl font-bold">This section adapts to dark mode</h2>
  <p className="text-gray-600 dark:text-slate-300">The colors change based on the current theme.</p>
</div>

{/* Basic transition for a single element */}
<div className="theme-transition bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 p-4 rounded-lg">
  This element smoothly transitions colors in dark mode
</div>

{/* Transition for an element and all its children */}
<div className="theme-transition-all bg-white dark:bg-slate-800 p-6 rounded-lg">
  <h3 className="text-gray-900 dark:text-white text-lg font-bold">Smooth Transitions</h3>
  <p className="text-gray-600 dark:text-slate-300 mt-2">This text and all other elements inside will transition smoothly</p>
  <button className="mt-4 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded">
    Button with transitions
  </button>
</div>
```

## Theme Toggle Component
```jsx
const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check for saved preference or system preference
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  useEffect(() => {
    // Apply or remove dark class on document element (not body)
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);
  return (
    <button 
      className="theme-toggle"
      onClick={() => setIsDarkMode(!isDarkMode)}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="theme-toggle-thumb"></span>
      <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
    </button>
  );
};
// Usage in your app
<div className="flex items-center space-x-2">
  <span className="text-sm dark:text-slate-300">Light</span>
  <ThemeToggle />
  <span className="text-sm dark:text-slate-300">Dark</span>
</div>
```

## Responsive Utilities
```jsx
<div className="responsive-hide">
  This content is hidden on mobile but visible on larger screens
</div>

<div className="mobile-only">
  This content is only visible on mobile devices
</div>
```

## Mobile-First Design
```jsx
<div className="p-4 sm:p-6 md:p-8">
  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Responsive Title</h1>
  <p className="text-sm sm:text-base md:text-lg mt-2">This content adjusts based on screen size, starting with mobile styling.</p>
  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
    <button className="btn btn-primary w-full sm:w-auto">Primary Action</button>
    <button className="btn bg-gray-200 text-gray-800 w-full sm:w-auto mt-2 sm:mt-0">Secondary Action</button>
  </div>
</div>
```
