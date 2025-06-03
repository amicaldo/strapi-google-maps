# Google Maps API Singleton Fix

## Problem
When multiple Google Maps components are nested inside a Strapi model (e.g., 2+ components with gmaps fields), the application crashes with:

```
google api is already presented LoadScript.tsx:58:16
```

This happens because each `MapView` component was creating its own `LoadScript` instance, but the Google Maps JavaScript API should only be loaded once per page.

## Solution
Implemented a singleton pattern using React Context to manage Google Maps API loading globally:

### 1. GoogleMapsProvider (`admin/src/components/Input/GoogleMapsProvider.tsx`)
- Creates a global state management system for Google Maps API loading
- Ensures only one `LoadScript` component is ever rendered
- Uses a global state object with listeners to coordinate across multiple provider instances
- Handles loading states, errors, and API key management

### 2. Updated MapView (`admin/src/components/Input/MapView.tsx`)
- Removed individual `LoadScript` components
- Now uses `useGoogleMaps()` hook to access shared loading state
- Renders maps only when the global API is loaded
- Improved error handling for API loading failures

### 3. Updated Input (`admin/src/components/Input/index.tsx`)
- Wraps `MapView` with `GoogleMapsProvider`
- Each input field gets its own provider instance, but they coordinate globally

## How It Works
1. First Google Maps field initializes the global loading state
2. Subsequent fields detect the existing loading process and wait
3. Once loaded, all fields can render their maps using the same API instance
4. Error states are shared across all instances

## Benefits
- ✅ Fixes the "google api is already presented" error
- ✅ Supports unlimited nested Google Maps fields
- ✅ Better error handling and loading states
- ✅ Maintains all existing functionality
- ✅ No breaking changes to the API

## Files Changed
- `admin/src/components/Input/GoogleMapsProvider.tsx` (new)
- `admin/src/components/Input/MapView.tsx` (updated)
- `admin/src/components/Input/index.tsx` (updated) 