
# Tailwind Quick Reference

Essential components and utilities for everyday development.

## Buttons
```jsx
<button className="btn btn-primary">Primary</button>
<button className="btn btn-secondary">Secondary</button>
<button className="btn btn-primary btn-sm">Small</button>
<button className="btn btn-primary btn-lg">Large</button>
<button className="btn btn-primary" disabled>Disabled</button>
```

## Forms
```jsx
<div className="form-group">
  <label className="form-label" htmlFor="email">Email</label>
  <input id="email" type="email" className="input" />
  <p className="form-error">Error message</p>
</div>

<select className="select">
  <option>Choose option</option>
</select>

<textarea className="textarea" rows="3"></textarea>
```

## Cards
```jsx
<div className="card card-padding">
  <h3 className="heading-5">Card Title</h3>
  <p className="text-body">Card content</p>
</div>
```

## Typography
```jsx
<h1 className="heading-1">Main Title</h1>
<h2 className="heading-2">Section Title</h2>
<p className="text-body">Body text</p>
<p className="text-caption">Small text</p>
```

## Badges & Alerts
```jsx
<span className="badge badge-success">Success</span>
<span className="badge badge-error">Error</span>

<div className="alert alert-success">
  <p>Success message</p>
</div>
```

## Layout
```jsx
<div className="container container-lg">Content</div>
<div className="flex-between">
  <span>Left</span>
  <span>Right</span>
</div>
<div className="flex-center">Centered</div>
```

## Navigation
```jsx
<nav className="navbar">
  <span className="heading-6">Brand</span>
  <div className="flex gap-2">
    <a href="#" className="nav-link">Home</a>
    <a href="#" className="nav-link nav-link-active">Active</a>
  </div>
</nav>
```

## Table
```jsx
<div className="table-container">
  <table className="table">
    <thead className="table-header">
      <tr>
        <th className="table-header-cell">Name</th>
        <th className="table-header-cell">Email</th>
      </tr>
    </thead>
    <tbody className="table-body">
      <tr className="table-row">
        <td className="table-cell">John</td>
        <td className="table-cell">john@example.com</td>
      </tr>
    </tbody>
  </table>
</div>
```

## Modal
```jsx
<div className="modal-backdrop">
  <div className="modal-content">
    <div className="modal-header">
      <h3 className="heading-5">Title</h3>
    </div>
    <div className="modal-body">
      <p>Content</p>
    </div>
    <div className="modal-footer">
      <button className="btn btn-secondary">Cancel</button>
      <button className="btn btn-primary">Save</button>
    </div>
  </div>
</div>
```

## Utilities
```jsx
{/* Spacing */}
<div className="stack-y">Vertical spacing</div>
<div className="stack-x">Horizontal spacing</div>

{/* Grid */}
<div className="grid-auto-fit gap-4">Auto-fit grid</div>

{/* Animations */}
<div className="animate-fade-in">Fade in</div>
<div className="animate-slide-in-up">Slide up</div>

{/* Theme */}
<div className="theme-transition">Smooth theme changes</div>
```

## Color Scale
```
Primary: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950
Success: 50, 500, 600, 700, 900
Warning: 50, 500, 600, 700, 900
Error: 50, 500, 600, 700, 900
Gray: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950
```

## Button Sizes
- `btn-xs` - Extra small
- `btn-sm` - Small  
- `btn` - Default
- `btn-lg` - Large
- `btn-xl` - Extra large

## Container Sizes
- `container` - Default
- `container-sm` - Small (max-w-3xl)
- `container-lg` - Large (max-w-7xl)

## Dark Mode
```jsx
// Dark mode hook (recommended pattern)
const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newIsDark);
  };
  
  return { isDark, toggleDarkMode };
};

// Usage in component
const { isDark, toggleDarkMode } = useDarkMode();

// Dark mode toggle button
<button 
  onClick={toggleDarkMode}
  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
>
  {isDark ? '☀️' : '🌙'}
</button>

// Dark mode classes (always use this pattern)
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Adapts to theme
</div>
```
