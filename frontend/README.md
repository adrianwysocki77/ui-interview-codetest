# Security Dashboard

An interactive dashboard showing security metrics over time with filtering options.

## How to Run

### Requirements

- Node.js 16+
- Yarn

### Configuration

No special environment variables are required. The application is configured to automatically proxy GraphQL requests to the backend server running on http://localhost:3000.

### Quick Start

```bash
# Install packages
yarn install

# Start development server
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Approach

I built this dashboard with a focus on performance and user experience:

- Used Vite for its fast development experience and build performance
- Implemented the D3.js visualization within React using custom hooks
- Created reusable components with TypeScript for type safety
- Used Material UI for consistent styling and responsiveness
- Implemented filtering with proper state management for smooth updates

## Challenges and Solutions

1. **D3 and React Integration**
2. **Chart Alignment Issues**: Timestamps in different timezones caused visual misalignment between data points and axis labels. Fixed by implementing UTC-based date handling and proper parsing of ISO strings.

3. **Filter Performance**: Initially, changing filters caused excessive re-renders. Optimized by moving filter state management to local component state and implementing proper memoization (still doesn't work perfectly).

4. **Overlapping Labels**: Date labels overlapped in the 30-day view. Created a dynamic tick spacing algorithm that adjusts based on data density.

## Features and Improvements

- Interactive chart with D3.js and smooth transitions
- Criticality level filters with visual indicators
- Smart tooltips that show detailed information on hover
- Responsive design that adapts to all screen sizes
- Dark mode theme for better visualization of security data
- Optimized tooltip positioning to prevent edge cutoff
- Smart date handling to prevent timezone-related display issues
