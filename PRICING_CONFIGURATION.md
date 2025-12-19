# AirBear Pricing Configuration

## Current Pricing Structure

### Standard Rides: **$4.00 Flat Rate**
- All rides between the 16 GPS spots cost $4.00
- No distance-based pricing
- Simple, predictable pricing for customers

### Implementation
Located in: `client/src/lib/spots.ts`

```typescript
export const estimateRideFare = (distance: number): number => {
  return 4.00; // Flat rate for all standard rides
};
```

### The 16 Standard Spots
1. Court Street Downtown
2. Riverwalk BU Center
3. Confluence Park
4. Southside Walking Bridge
5. General Hospital
6. McArthur Park
7. Greenway Path
8. Vestal Center
9. Innovation Park
10. BU East Gym
11. BU Fine Arts Building
12. Whitney Hall
13. Student Union
14. Appalachian Dining
15. Hinman Dining Hall
16. BU Science Building

## Custom Rides

For rides outside the 16 standard spots, you can:

1. **Add More Spots to Database:**
   ```sql
   INSERT INTO public.spots (id, name, latitude, longitude, description, amenities, is_active) 
   VALUES ('custom-location', 'Custom Location Name', 42.123456, -75.123456, 'Description', ARRAY['Amenity1'], true);
   ```

2. **Implement Custom Pricing:**
   - Option A: Keep $4 flat rate for all destinations
   - Option B: Add premium pricing for custom locations
   - Option C: Implement distance-based pricing for custom rides only

### To Add Custom Pricing Logic:

Modify `estimateRideFare` function:

```typescript
export const estimateRideFare = (distance: number, isCustomRide?: boolean): number => {
  if (isCustomRide) {
    // Custom ride pricing (example: $2 base + $1 per km)
    return 2.00 + (distance * 1.00);
  }
  return 4.00; // Standard flat rate
};
```

## Payment Flow

1. User selects pickup and destination on map
2. System calculates fare: **$4.00**
3. User proceeds to checkout
4. Payment processed via Stripe
5. Ride confirmed

## Stripe Configuration

- **Live Mode**: Enabled
- **Public Key**: Configured in `.env`
- **Secret Key**: Configured in `.env`
- **Webhook**: Needs to be set up for production

## Future Pricing Options

Consider these pricing strategies:

### 1. **Time-Based Surge Pricing**
```typescript
const getSurgePricing = (hour: number): number => {
  if (hour >= 17 && hour <= 19) return 1.5; // Rush hour
  if (hour >= 22 || hour <= 6) return 1.25; // Late night
  return 1.0; // Normal
};
```

### 2. **Membership Discounts**
```typescript
const applyMembershipDiscount = (basePrice: number, userRole: string): number => {
  if (userRole === 'premium') return basePrice * 0.8; // 20% off
  if (userRole === 'student') return basePrice * 0.9; // 10% off
  return basePrice;
};
```

### 3. **Multi-Ride Packages**
- 5 rides: $18 ($3.60 per ride)
- 10 rides: $35 ($3.50 per ride)
- Monthly unlimited: $100

## Recommendations

For your current setup:

✅ **Keep $4 flat rate** - Simple and easy to communicate
✅ **Add custom ride option** - For destinations outside the 16 spots
✅ **Consider student discounts** - Since you're near BU campus
✅ **Future: Add packages** - Encourage repeat customers

## Testing

To test pricing:
1. Go to https://airbear.me/map
2. Select any two spots
3. Click "Book Ride"
4. Verify fare shows as $4.00
5. Proceed to checkout
6. Use Stripe test card: `4242 4242 4242 4242`

## Summary

- ✅ Pricing set to $4.00 flat rate
- ✅ Works for all 16 standard spots
- ✅ Custom rides can be added as needed
- ✅ Stripe configured for live payments
- ✅ Simple, predictable pricing for customers
