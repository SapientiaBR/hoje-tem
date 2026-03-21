

## Plan: Add MapTab, CalendarTab, and integrate into Index.tsx

### 1. Install dependencies
- Add `react-leaflet`, `leaflet`, `@types/leaflet` to the project

### 2. Create `src/components/MapTab.tsx`
- Leaflet map centered on São Paulo with event markers
- Popup with event name, location, and "Ver detalhes" link
- Fix default Leaflet icon URLs
- Fallback coordinates for events without lat/lng

### 3. Create `src/components/CalendarTab.tsx`
- Date picker using existing `Calendar` component
- Filter events by selected date using `isSameDay` from date-fns
- Show matching events as `EventCard` list below calendar

### 4. Update `src/pages/Index.tsx`
- Import `MapTab` and `CalendarTab`
- Replace `renderMapa()` placeholder with `<MapTab eventos={eventos} onEventClick={setSelectedEvento} />`
- Replace `renderCalendario()` placeholder with `<CalendarTab eventos={eventos} isFavorito={isFavorito} onToggleFavorito={toggleFavorito} onEventClick={setSelectedEvento} />`

### Technical note
The pasted JSX was stripped of angle brackets, so I'll reconstruct the components faithfully based on the structure and text content provided.

